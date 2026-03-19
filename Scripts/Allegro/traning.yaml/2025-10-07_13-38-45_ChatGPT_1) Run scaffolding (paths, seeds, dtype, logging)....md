# 1) Run Scaffolding



The run scaffolding block names the filesystem home for every artifact the training process will produce, fixes the random draws that would otherwise drift between executions [drift between executions? that is vague, I don't know what you mean by that], controls whether subsequent launches pick up where you left off, and chooses the numeric precision that all computations will use. 

The pairing of `root` and `run_name` is your experiment’s address on disk. Under `root`, the trainer will manage a `process/` directory for cached, preprocessed data and a directory named by `run_name` for everything produced by the run itself: checkpoints, configuration snapshots, learning curves, and logs. That separation is deliberate. Processed data usually persists across variations of the model; you don’t want to re-vectorize neighbor lists or re-normalize targets each time you tweak a hyper-parameter. By contrast, the run directory is ephemeral and specific to a single experiment. The trainer also protects you from accidental overwrites: if a directory with the same `run_name` already exists, a timestamp suffix is appended automatically, ensuring that a new attempt cannot trample the previous one. 

```bash
root: results/Li3PS4-RANDOM              # run root; will create root/{process,run_name}
run_name: run_Li3PS4-RANDOM              # checkpoints + logs; timestamped if already exists
```


Reproducibility comes next, and here the two seeds serve different but complementary roles. The main `seed` governs stochasticity in the model itself: weight initialization, data shuffling if enabled, and any randomized decisions inside the training loop. Fixing it freezes the initial conditions of optimization so that subsequent runs differ only when you intend them to. The `dataset_seed` addresses a subtler source of variability: which subset and order of structures are selected when you subsample or split. Even with a sequential split, various loaders and sampling utilities can rely on this seed to ensure you are training and validating on exactly the same examples. Keeping both seeds fixed is what turns a “result” into a repeatable procedure. When you want to probe variance across different initializations, you change `seed` and hold `dataset_seed` constant; when you want to test sensitivity to which geometries are seen during training, you vary `dataset_seed` and keep `seed` fixed. 


```bash
seed: 123456                             # model init seed (weights, etc.)
dataset_seed: 123456                     # dataset sampling/ordering seed
```


The `append` switch controls how your run tells its story. With `append: true`, resuming a halted job continues writing to the same log rather than starting a new file. For long, resource-limited trainings or shared clusters where preemptions happen, appending avoids fragmented records and simplifies later analysis. If you prefer a clean slate when changing hyperparameters or debugging an odd learning curve, you can set it to false and force a new log; otherwise, appending is a safe default.


Finally, `default_dtype` selects the arithmetic lens through which every tensor is viewed. Double precision (`float64`) is more expensive in memory and throughput than single precision (`float32`), but it buys you numerical stability in regimes that often matter for interatomic potentials: small force magnitudes, tightly balanced energy differences, and delicate cancellations in equivariant tensor blocks. Allegro’s symmetry-preserving operations can amplify roundoff if you are aggressively wide or deep; double precision reduces the chance that training derails due to accumulated numerical error. There are scenarios where `float32` is the right choice—very large datasets on memory-constrained GPUs, or quick architecture searches where you prioritize speed over the last few meV/Å—but the safer place to start, especially with small batches and force learning, is `float64`. If you later migrate to mixed precision, you should do so intentionally and monitor both validation error and invariance checks.


```bash
append: true                             # keep writing to existing log on resume
default_dtype: float64                   # numeric precision (float32 | float64)
```





# 2)The DATA Block



## ChatGPT
The data block tells the trainer what a “structure” is, where to find many of them, and how to label each atom so the model can attach learned parameters to the right species. Choosing `dataset: ase` delegates file reading to the Atomic Simulation Environment, which is exactly what you want when your structures, energies, and forces live in an extended XYZ file. With ASE as the backend, the loader calls `ase.io.read` under the hood; the small `ase_args` stanza pins the format to `extxyz`, the variant of XYZ that allows per-structure metadata and per-atom arrays. That single decision keeps the whole pipeline simple: you can stream all geometries from one file, append new frames as your calculations finish, and rely on ASE’s battle-tested parsers rather than inventing a custom schema.


```bash
dataset: ase                             # prefer ASE + extxyz for simplicity
```


`dataset_file_name: sitraj_1.xyz` is the only path the loader needs. It should point to an `extxyz` that contains, for each frame, positions and chemical identities plus the supervised labels Allegro trains on. In practice this means energies on the structure and forces on each atom; if you have cell and PBC information, include those too so neighbor lists and cutoff logic are consistent with how the configurations were generated. Extxyz encodes these as properties and key–value pairs in the comment fields, and ASE converts them back into arrays on the `Atoms` object. As long as the names are the usual ones—“energy” on the configuration and “forces” on atoms—NequIP’s dataloader will discover them automatically. If you’re exporting from ASE itself, `ase.io.write(atoms, "sitraj_1.xyz", format="extxyz", append=True)` produces exactly the kind of file this block expects, and you can keep appending new structures without touching the YAML.


```bash
dataset_file_name: sitraj_1.xyz
ase_args:
  format: extxyz
```


The last piece, `chemical_symbol_to_type`, fixes the model’s internal notion of element types. Allegro and NequIP maintain per-species scales and parameters; to do that deterministically they need a compact integer type index for each element present in the data. When the upstream file provides atomic numbers or symbols, the mapping pins those identities to stable indices that won’t change from run to run. Even in a single-element dataset like this `Si: 0`, the explicit map is worth keeping because it removes any ambiguity if you later introduce a second element or merge datasets created at different times. Downstream components that rescale by species, compute per-species metrics, or allocate species-conditioned blocks in the network will all reference these indices.

```bash
# Map symbols to internal type indices (required if input has atomic numbers)
chemical_symbol_to_type:
  Si: 0
```

Two practical consequences flow from these choices. First, the order of structures in the `extxyz` now matters whenever you select a sequential split in the training section; the first `n_train` frames will be your training set and the next `n_val` frames will be validation, so curate the file accordingly or switch to a randomized split if you want stratification. Second, the units and naming conventions you bake into the extxyz become the source of truth. Keep energies and forces in consistent units throughout a project, and use the same field names every time you regenerate the file; doing so avoids tedious remapping later and ensures that cached, preprocessed datasets under `root/process` remain valid across runs.



#  3) The MODEL Block


In the `model_builders` list you decide which building blocks NequIP should assemble into the actual predictor. Each entry names a module that the trainer will wire into the computation graph in order, so the list reads like a pipeline: construct an Allegro potential, put it into a numerically well-behaved scale by species, expose forces consistently from the total energy, and finally align the model’s raw outputs with the dataset’s units and offsets.


The heart of the stack is `allegro.model.Allegro`. This is the equivariant interatomic potential itself: it takes atom types and positions, builds neighbor graphs within the cutoff, encodes edges and local environments, passes information through a small number of tensor-product layers, and produces per-edge energy contributions that are symmetrically correct. Those edge energies are pooled to an atom-wise and then structure-level energy, and because Allegro is constructed to respect E(3) symmetry, translating or rotating the structure doesn’t change the scalar energy while permutations of identical atoms are handled by design. [what do you mean handled by design? That is vague.]

Immediately after the core comes `PerSpeciesRescale`. Real datasets are rarely balanced: some species are much more numerous, carry different baseline per-atom energies, or span feature magnitudes that differ by orders of magnitude. This utility introduces simple, species-conditioned scale and shift parameters that normalize those differences before the loss is computed. As a result, optimization becomes smoother, the learning rate you chose behaves more uniformly across compositions, and per-species metrics don’t get dominated by whichever element happens to contribute the largest absolute numbers.

The `ForceOutput` entry tells NequIP to treat forces as outputs by differentiating the total energy with respect to atomic positions and packaging that gradient into the batch dictionary. Because forces are defined as minus the energy gradient, exposing them this way guarantees thermodynamic consistency: whatever the energy head says, the force head says exactly its derivative. That matters for two reasons. First, your loss almost certainly includes a force term; this path computes it without duplicating parameters or breaking invariances. Second, when you later evaluate or export the model, you get forces “for free” from the same scalar field the optimizer has learned, not from a separate regressor that might disagree with it.

Finally, `RescaleEnergyEtc` is the adapter that lines up model space with data space. During training it estimates global scale and bias terms—per atom and per structure, as configured—from the dataset statistics and applies an affine transformation so that predicted energies and their gradients live in the same units and baseline as your labels. If your `extxyz` stores energies in eV and forces in eV/Å, this is where the network’s internal, normalized quantities are mapped back to those units for logging, early stopping, and checkpointing. Because forces are gradients of energy, the rescaling is applied in a way that keeps the relationship intact; an energy shift changes nothing about forces, while an energy scale multiplies forces by the same factor. The result is a model whose learning dynamics are well-conditioned but whose outputs still match the physical units you expect to report.

Two practical implications follow from this arrangement. The order of builders matters conceptually: you want to build the energy-producing Allegro core first, normalize and package its outputs in a species-aware way, expose forces as gradients of that same energy, and only then perform any global rescaling so logs and checkpoints reflect the quantities you care about. And because all four modules are pure composition rather than hidden defaults, you can reason about them. If forces look noisy while energies are clean, you know to look at the Allegro depth, cutoff, or batch size rather than suspecting an inconsistent force head; if training diverges when you add a second element, you know to inspect the rescaling step rather than rewriting the architecture. In short, this short list specifies not just what the model is, but also how it will behave numerically and how its outputs will be interpreted, which is why it’s the right place to start reading any Allegro configuration.



```bash
model_builders:
  - allegro.model.Allegro                # Allegro core
  - PerSpeciesRescale                    # per-species rescaling (common NequIP utility)
  - ForceOutput                          # add force head via E gradients
  - RescaleEnergyEtc                     # energy/force rescale utilities
```



The cutoff radius `r_max` sets the horizon of interaction. Allegro constructs a graph by connecting atom i to any atom j within distance $r_{ij} \le r_\text{max}$, and all message passing, tensor products, and energy contributions are confined to this subgraph. In practice, $r_\text{max}$ should be large enough to capture the physically relevant part of the potential—short for covalent solids with tight bonding, longer for ionic or metallic systems with slower-decaying correlations—but not so large that neighbor lists explode and training becomes memory-bound. The units are whatever your dataset uses; if your extxyz puts positions in ångström, then $r_\text{max}=6.0$ means a six-ångström sphere around each atom. Because energy is accumulated as a sum over edges or atoms, NequIP normalizes by the typical neighborhood size so that predicted magnitudes don’t drift simply because some structures have denser packing. When `avg_num_neighbors: auto`, the data pipeline precomputes the mean neighbor count under the current cutoff and uses it to scale aggregations, which stabilizes optimization when you mix cells or phases that differ appreciably in density.


```bash
# Neighborhood / cutoff
r_max: 6.0                               # radial cutoff (Å or dataset length units)
avg_num_neighbors: auto                  # auto precompute for normalization
```


Once the neighborhood is defined, Allegro projects pairwise distances onto a set of radial basis functions. The Bessel basis is a standard choice: for a given cutoff, one defines functions that look like spherical Bessel modes confined to the interval $[0, r_\text{max}]$, typically $j_n(\alpha_n r / r_\text{max})$ with $\alpha_n$ the nth root of the Bessel function or a related construction. Setting `num_bessels_per_basis: 8` gives you eight such radial channels per “basis,” which is typically enough to interpolate smooth, short-range behavior but can be increased if your target has sharp features with respect to distance. The flag `BesselBasis_trainable: true` lets the network learn small adjustments to those roots, effectively tuning the radial knots to where the data have structure. That makes the basis adaptive while keeping it compact. The outputs of this radial projection are then expanded into a latent tensor with width set by `num_tensor_features: 8`. Think of this as the number of channels per radial-angular slice that the model can use to store local information before it is mixed by the tensor-product layers; increasing it provides capacity but also increases memory and compute roughly linearly.

Distances are not simply chopped at the cutoff; they are enveloped by a smooth window so that messages and energies taper to exactly zero with continuous derivatives as $r \to r_\text{max}$. The parameter `PolynomialCutoff_p: 6` selects the order of that envelope. Higher p produces a flatter passband and a steeper yet smooth decay near the boundary, which reduces artifacts from truncation and helps forces remain well-behaved at the edge of the neighbor list. In force-learning regimes this smoothness matters: discontinuities at the cutoff would otherwise show up as spurious spikes in $-\nabla E$.


```bash
# Radial basis & cutoff envelope
BesselBasis_trainable: true              # learn Bessel roots
num_bessels_per_basis: 8                 # radial channels
num_tensor_features: 8                   # Allegro latent tensor width per channel
PolynomialCutoff_p: 6                    # smooth cutoff envelope power
```


Angular resolution is governed by `l_max`, which limits the maximum order $\ell$ of spherical harmonics the model can use to encode directionality. With $\ell=0$ you would only have isotropic, purely radial information; $\ell=1$ captures vector-like features, while $\ell=2$ adds quadrupolar structure, and so on. Choosing `l_max: 2` is a common sweet spot: it’s fast enough for routine training yet rich enough to represent directional bonding and many-body geometric cues that isotropic models miss. Pushing to $\ell=3$ can help in highly anisotropic environments but increases the cost of tensor products and the risk of overfitting if the dataset is small. The `parity` setting selects the symmetry group under which features transform. With `parity: o3_full`, the network is built to be equivariant under the full orthogonal group $O(3)$, meaning it transforms correctly under both proper rotations and improper operations like inversion; scalars remain scalars, vectors flip sign appropriately, and higher-order tensors follow suit. Alternatives such as `so3` restrict to proper rotations only, and `o3_restricted` applies additional constraints. For materials where inversion symmetry is not guaranteed at the local environment level, the full $O(3)$ choice is robust and ensures that predicted energies are true invariants and forces transform as vectors regardless of how a structure is oriented or mirrored in space.


```bash
# Angular resolution & symmetry
l_max: 2                                 # max spherical harmonics order (1 fast, 2 typical)
parity: o3_full                          # E(3) equivariance choice: o3_full | o3_restricted | so3
```


There are a few tradeoffs implicit in these settings. The expected number of neighbors scales roughly like the local number density times the volume of the cutoff sphere, so doubling $r_\text{max}$ can octuple the edge count and, with it, memory use. Increasing the number of Bessel functions or tensor features expands the channel dimension of messages, pushing both compute and parameter count. Raising $l_\text{max}$ expands the angular basis and multiplies the cost of tensor products across irreducible representations. In return, each of these expansions gives the model finer spatial or angular resolution. The recipe you have—moderate cutoff, trainable radial basis with eight channels, a smooth $p=6$ envelope, and $l_\text{max}=2$ with full $O(3)$ parity—is a conservative, physically sound starting point that captures directional bonding and decays interactions gracefully at the cutoff while keeping the graph small enough for quick iteration. From here, you can scale one axis at a time as the validation error and ablations suggest where the representation is currently bottlenecked.


In Allegro, depth comes from stacking tensor-product layers that shuttle information over the neighbor graph while preserving E(3) symmetry. Setting `num_layers: 2` chooses a middle ground: one layer is often too shallow to express the multi-step geometric correlations that give forces their subtlety, while three or more layers increase cost and can overfit if your dataset is small. Width is governed primarily by `env_embed_multiplicity: 8`, which multiplies the number of scalar and tensor channels carried by each irreducible representation. More multiplicity means more independent “lanes” in which the model can store and combine local descriptors; it scales memory and compute roughly linearly and typically improves accuracy until you hit a data or optimization limit. The switch `embed_initial_edge: true` keeps a copy of the raw distance- and type-dependent edge embedding available alongside progressively transformed features. That skip connection gives later layers access to unfiltered geometric cues—useful for stability and for learning short-range structure without having to recreate it through many tensor products.


```bash
# Depth/width
num_layers: 2                            # Allegro tensor-product layers (1–3 common)
env_embed_multiplicity: 8                # feature multiplicity; ↑ => more capacity
embed_initial_edge: true                 # include raw edge embedding
```


Around the equivariant core, Allegro uses conventional MLPs wherever symmetry does not constrain the operation. The two-body embedding MLP precedes most equivariant mixing and turns pairwise geometric primitives into a richer, learnable basis. Because it acts channel-wise on invariant inputs, it is computationally cheap compared with tensor products, which makes it an excellent place to add expressive power. Your configuration makes that explicit with `two_body_latent_mlp_latent_dimensions: [128, 256, 512, 1024]`, a steadily widening tower that lets the network bend the raw radial and species signals into a smooth, high-capacity latent before any angular coupling. The `silu` nonlinearity is a good default here: it is smooth with nonzero slope at the origin, which helps gradient flow in small-magnitude regimes common to well-relaxed structures. Uniform initialization is likewise pragmatic; with per-species and global rescaling elsewhere, you rarely need fancier schemes to keep activations well-conditioned.


```bash
# Two-body embedding MLP (cheap; good place to add capacity)
two_body_latent_mlp_latent_dimensions: [128, 256, 512, 1024]
two_body_latent_mlp_nonlinearity: silu
two_body_latent_mlp_initialization: uniform
```


Deeper in the stack, a separate “latent MLP” operates on scalar parts of the equivariant features after tensor products have created higher-order couplings. Its role is to let the model re-mix and compress information that is already equivariant into a form that is easier to read out as energy. You’ve given it three 1024-unit layers with the same `silu` nonlinearity and uniform init, which is a sizeable but still affordable headroom for most small materials datasets. The flag `latent_resnet: true` turns these layers into residual updates rather than plain feed-forward blocks. Residual connections matter here for the same reason they mattered in computer vision: they shorten effective depth for optimization, mitigate vanishing gradients through the equivariant tower, and let the network learn corrections around a good initial representation instead of having to reconstruct it from scratch after every layer. In practice, turning this on is one of the simplest ways to stabilize training when you push either `num_layers` or multiplicity higher.


```bash
# Latent MLP over scalar features
latent_mlp_latent_dimensions: [1024, 1024, 1024]
latent_mlp_nonlinearity: silu
latent_mlp_initialization: uniform
latent_resnet: true                      # ResNet update in latent scalar space
```


Not every MLP pays for itself. The “environment-embedding” MLP sits at the interface that maps aggregated neighbor information into the channel layout used by the next equivariant block. For many systems it is best left empty, which Allegro interprets as a single learned linear layer. That is exactly what your `env_embed_mlp_latent_dimensions: []` and `env_embed_mlp_nonlinearity: null` specify. The linear map preserves the clean spectral structure of the features without injecting additional nonlinearity at a point where it often adds capacity but little benefit. If you later find that the model underfits even after raising multiplicity, this is one of the cheaper places to introduce a small hidden layer, but the default choice favors simplicity and speed.

```bash
# Environment-embedding MLP (often best left empty = linear layer)
env_embed_mlp_latent_dimensions: []
env_embed_mlp_nonlinearity: null
env_embed_mlp_initialization: uniform
```

All of these latent manipulations would be moot unless the network can turn them into a scalar field whose gradient matches your force labels. Allegro does that by predicting per-edge energies that are then pooled to atoms and summed to a total energy. The small “edge head” MLP controls this last step. With `edge_eng_mlp_latent_dimensions: [128]` and no nonlinearity, you have a single hidden layer that mixes the final equivariant latents into a scalar for each edge. The absence of a nonlinearity is deliberate: the equivariant tower and earlier MLPs already supply abundant nonlinearity, and a linear readout is often sufficient and easier to calibrate with the global rescaling module. If validation suggests systematic underfitting localized to the readout, modestly widening this head is cheap; if the forces are noisy while energies look fine, the bottleneck is almost never here and more likely in the cutoff, depth, or multiplicity.

```bash
# Final per-edge energy head (maps Allegro latent -> edge energies)
edge_eng_mlp_latent_dimensions: [128]
edge_eng_mlp_nonlinearity: null
edge_eng_mlp_initialization: uniform
```


The practical message is that Allegro’s capacity lives on two orthogonal axes, and this block exposes both with coarse but effective controls. Depth through `num_layers` governs how many steps of geometric reasoning the model can perform over the graph; width through multiplicity and latent dimensions governs how many distinct motifs it can represent at each step. Residual updates and an initial edge skip keep those added parameters trainable rather than merely large. The surrounding MLPs offer inexpensive places to bend invariant signals and tidy up scalar latents before the readout, while the final edge head turns everything into energies without disturbing equivariance. Starting from your choices, you can scale capacity gradually: increase multiplicity before you add layers, keep the two-body MLP generous because it is cheap, and only complicate the environment-embedding path if ablations show it limiting accuracy.


# The Train and Validation Block



The pair `n_train: 15` and `n_val: 8` is the most basic declaration: from whatever structures the loader exposes, only the first twenty-three will participate in learning, with fifteen used to fit parameters and eight held out to measure generalization during training. On paper those are tiny counts, but in interatomic modeling a single structure carries hundreds to thousands of force components, so the effective number of supervised targets can still be large. What matters is that the validation set must represent the distribution you care about at inference time and must not leak near-duplicates of the training configurations. If your extxyz is a trajectory, neighboring frames are strongly correlated; using adjacent frames for train and validation will make the validation error look deceptively low. With a sequential split, curate the file so the first block and the next block are genuinely different regimes—distinct compositions, cell shapes, thermodynamic points, or well-separated snapshots—otherwise switch to a randomized split when you’re ready to report numbers.


```bash
n_train: 15                              # number of training structures
n_val: 8                                 # number of validation structures
```


The line `train_val_split: sequential` tells the trainer to take the first `n_train` frames it sees as training and the next `n_val` as validation, in file order, which is why curation matters. The follow-on choice `shuffle: false` means that within each epoch the data loader will present those frames in the same fixed sequence. For debugging, this determinism is great: you see the same mini-batches every time, loss curves are smooth, and any changes you observe come from code or hyperparameters rather than sampling noise. For production training, especially once the split itself is randomized, shuffling improves optimization by decorrelating consecutive gradients and preventing the model from repeatedly seeing easy and hard batches in the same rhythm. The rule of thumb is simple: keep determinism while you are plumbing a new dataset or model; turn on `shuffle: true` when you start tuning and comparing runs.

```bash
train_val_split: sequential              # sequential | random (sequential uses file order)
shuffle: false                           # data loader shuffle (usually true is best)
```

Batch size is the lever that controls gradient noise and memory at once. With `batch_size: 2`, the optimizer accumulates loss and gradients over two structures before taking a step. When you supervise on forces, small batches are not a compromise—they are the norm. Each structure contributes many atomic force components, so even a tiny batch provides a rich, high-variance signal that helps the model escape shallow minima and reduces the risk that a few atypical configurations dominate a step. Larger batches can stabilize wall-clock time per epoch but quickly run into GPU memory limits once you consider neighbor lists, equivariant tensors, and the need to keep activations for backpropagation. If you want to experiment, adjust the learning rate with the batch size: increasing the batch often tolerates a modestly larger step; decreasing it may benefit from a slightly smaller one or from enabling an exponential moving average of weights later in the config.

Finally, `max_epochs: 1000000` is a ceiling rather than a target. It exists to guarantee that a runaway job will eventually halt even if early stopping is misconfigured. In practice, your training will terminate far earlier based on validation-loss patience, learning-rate floor, or wall-clock limits defined elsewhere. Setting a huge cap here lets the real stopping logic—“stop when the model stops improving in a meaningful way”—be the thing that decides when you are done, while still protecting you from infinite loops. Read your curves with that in mind: when the run ends after a few hundred or a few thousand epochs, it is not because it “failed to reach one million,” but because it reached the point where additional passes weren’t buying better validation accuracy.

```bash
batch_size: 2                            # small batches recommended when training on forces
max_epochs: 1000000                      # hard cap; early stopping will trigger first
```



# 5 Optimization Block


The base learning rate at $10^{-3}$ is a sensible starting point for NequIP/Allegro on batches of one to a handful of structures. Adam adapts step sizes per parameter by maintaining first and second moments of recent gradients; at $\beta_1=0.9$ and $\beta_2=0.999$ you get the familiar behavior where updates carry momentum from the last few dozen steps while the denominator, dominated by the long second-moment window, damps coordinates that see persistent large gradients. In force learning, where each mini-batch yields many gradient contributions and the loss surface can change scale across layers, this adaptivity is more robust than plain SGD to the uneven conditioning introduced by equivariant tensor products. The small $\varepsilon=10^{-8}$ is the numerical shim that prevents division by zero when the second moment is tiny; it also gently limits the effective step size in very flat directions, which can matter early on when you are far from a good scale. You have AMSGrad disabled, which is the usual choice here: enforcing a non-increasing second-moment bound can help on certain pathological convex problems, but in deep potentials it often slows useful adaptation without a clear stability payoff.

Weight decay is set to zero, and that is the right default for two reasons. First, the model already includes explicit rescaling modules that keep activations and targets on comparable magnitudes; indiscriminate $L^2$ shrinkage would fight those calibrations and can bias energies when labels span wide ranges per atom. Second, equivariant layers couple parameters across irreducible representations in ways that make “uniform shrinkage” less meaningful than in plain MLPs. If you later add regularization, do it intentionally—via dropout in specific MLPs or priors on species scales—rather than by turning on decay globally and hoping for the best.

```bash
# ---------------------------------------------------------------------------
# 5) OPTIMIZATION — optimizer, base LR, EMA of weights
# ---------------------------------------------------------------------------
learning_rate: 0.001                     # typical: 5e-4 .. 2e-3
optimizer_name: Adam
optimizer_params:
  amsgrad: false
  betas: !!python/tuple [0.9, 0.999]
  eps: 1.0e-08
  weight_decay: 0.0
```

Even with Adam’s adaptivity, small batches inject noise into the update direction, and that noise shows up most obviously in validation energy, which is typically smoother and lower-variance than forces. The exponential moving average of weights addresses this by maintaining a shadow copy of the model parameters that evolves as $\theta_{\text{EMA}}\leftarrow \lambda\,\theta_{\text{EMA}} + (1-\lambda)\,\theta$ after each update. Evaluating on validation with $\theta_{\text{EMA}}$ acts like Polyak averaging: it filters out the high-frequency wander of $\theta$ around a good basin while preserving the long-term drift toward better minima. With $\lambda=0.99$, the effective half-life spans on the order of a hundred steps; if you later choose $0.999$, that window stretches by an order of magnitude and the EMA becomes even more inertial. The flag to “use number of updates” enables bias correction early in training, when the EMA has seen only a few points and would otherwise be biased toward the initial weights. Under the hood, the moving average is scaled by $1-(\lambda^t)$ so the shadow model reflects a true average from the start rather than an average plus a big chunk of the initialization.


Two practical interactions are worth keeping in mind as you tune. The learning rate and batch size form a coupled pair: if you increase the batch, you can often nudge the learning rate upward without destabilizing training; if you decrease the batch, the EMA becomes more valuable because it counteracts the extra gradient noise. And when you introduce learning-rate scheduling based on validation plateaus, the EMA will make plateaus easier to detect by damping validation jitter; that can trigger earlier and more meaningful drops in the step size, which in turn help the optimizer settle into narrower, lower-loss basins.

Framed this way, the block defines a temperament for the run. Adam handles the anisotropy and non-stationarity of gradients that come from equivariant message passing; the chosen betas bias it toward smooth, momentum-guided progress; the small epsilon and zero decay avoid numerical and statistical side effects that would fight your explicit rescaling; and the EMA supplies a quiet, low-variance view of the model for decisions about selection and stopping. If you later need more aggression, you move first by adjusting the learning rate; if you need more calm, you lengthen the EMA’s memory. Either way, the defaults you have are a balanced place to begin.

# 6 Loss and Metrics


The Loss and Metrics block separates two ideas. The loss is what the optimizer actually minimizes to fit the model parameters. The metrics are what you log and read in the progress bars and summaries so you can judge whether training is going well. Loss terms can be weighted and may include tricks to keep them numerically balanced; metrics are bookkeeping-faithful, human-readable scorecards that don't influence gradients unless you explicitly target one for scheduling or model selection.

The `loss_coeffs` section defines a two-task objective: learn forces and learn energies. Forces carry a weight of 1.0, and total energy carries an effective weight of 1.0 as well, but with an important twist: energy error is computed using `PerAtomMSELoss` . In practice, Allegro turns a configuration's total-energy error, $\Delta E=E_{\text {pred }}-E_{\text {ref }}$, into a per-atom error by dividing by the number of atoms $N$ in that structure before squaring and averaging. This prevents large supercells from overwhelming the loss just because they contain more atoms. Conceptually, your multi-task objective looks like

$$
\mathcal{L}=w_F \operatorname{MSE}(\mathbf{F})+w_E \operatorname{MSE}\left(\frac{\Delta E}{N}\right),
$$

with $w_F=w_E=1$ here. If the dataset mixes tiny and huge cells, or if we mostly care about energy densities, this choice is usually the right default. If we later find energy metrics lagging while force metrics look great, common remedies include slightly increasing the energy weight, checking that your reference energies are consistently offset (no hidden constant shifts), or enriching the training set with more diverse geometries that exercise the energy surface beyond near-equilibrium.


```bash
# Weighted multi-task loss; energy via per-atom MSE to balance with forces
loss_coeffs:
  forces: 1.0
  total_energy:
    - 1.0
    - PerAtomMSELoss
```


The `metrics_components` list controls exactly what gets reported during training and validation. We're logging four flavors for forces and four for energies. For forces, we record MAE and RMSE over the 3-vector force targets, and you also request species-resolved versions of those same quantities by setting `PerSpecies: true`. Species-resolved logging stratifies all atom-wise errors by element (e.g., Ce vs O), which is invaluable when one chemistry dominates the batch and masks a weakness on a minority species. The flag `report_per_component: false` means you treat each force vector as a whole when computing the error-i.e., you aggregate over vector magnitudes rather than printing separate $\mathrm{x}, \mathrm{y}, \mathrm{z}$ columns. That keeps the metrics compact and aligned with physical intuition: large directional mistakes show up in the magnitude. If you ever need to diagnose anisotropies in how the model learns, flipping to per-component reporting can reveal, for example, a systematic bias along one lattice axis, but it's noisier day-to-day.

For energy, we also log MAE and RMSE, each in two variants: on the raw total energy per configuration, and again with `PerAtom: true`, which reports the same errors normalized by $N$. The per-atom versions are easier to compare across mixed-size batches and tend to be more stable from epoch to epoch; the total-energy versions are what downstream atomistic codes ultimately care about when they sum energies to get reaction energies or equation-of-state curves. Tracking both lets you spot whether apparent progress is a normalization artifact. As a reminder, MAE (mean absolute error) gives a robust central tendency-linear penalty, less sensitive to outliers-while RMSE (root mean square error) penalizes rare, large mistakes quadratically. If your RMSE is much larger than your MAE, you likely have a tail of difficult structures or mislabeled data worth inspecting.



```bash
# Metrics to log; these names also appear in the progress header
metrics_components:
  - [forces, mae]
  - [forces, rmse]
  - [forces, mae,  {PerSpecies: true, report_per_component: false}]
  - [forces, rmse, {PerSpecies: true, report_per_component: false}]
  - [total_energy, mae]
  - [total_energy, mae, {PerAtom: true}]
  - [total_energy, rmse]
  - [total_energy, rmse, {PerAtom: true}]
```



# 7) LR SCHEDULER & EARLY STOPPING


Learning-rate schedules and early stopping are the brakes and steering of your training loop. They don’t change what the model can represent; they decide how patiently you let the optimizer search for a better basin, when you concede that progress has stalled, and how you conserve compute when the signal fades. In this configuration, both mechanisms are keyed to the validation loss so that all decisions are made on held-out data rather than training noise.

The scheduler `ReduceLROnPlateau` watches the selected metric—here, the composite validation loss—and treats a long stretch without improvement as evidence that the current step size is too large to descend further. The patience of fifty epochs sets the length of that stretch: if fifty passes go by without beating the best validation loss by more than the minimal improvement you define, the scheduler triggers. The action it takes is multiplicative, halving the learning rate via a factor of 0.5. This drop matters in practice because Adam’s adaptivity can take you quickly to the floor of a broad valley but will then dither around the bottom unless you reduce the step size enough to explore narrower, lower regions. Halving the rate after a sustained plateau is a conservative move: it preserves momentum across most coordinates while giving delicate directions a chance to refine. Because you enabled an exponential moving average of weights earlier, plateaus become easier to detect—the EMA filters out batch-to-batch jitter—so the scheduler will tend to react to real stalls rather than momentary noise.

Early stopping adds a stoplight where the scheduler provides only a yield sign. Its purpose is to terminate a run when further training is no longer paying off. The `early_stopping_delta` of $10^{-4}$ attached to the validation loss sets a significance threshold: the loop only counts a validation improvement if it beats the previous best by at least that amount. This protects you from declaring progress when fluctuations are within the noise floor, especially once the EMA has smoothed the curve. The flag that disables cumulative delta means the “best so far” is updated only by improvements that clear the threshold, preserving a crisp notion of what counts as better.

Time and learning-rate bounds provide two additional fail-safes. The upper bound on cumulative wall time, seven days, is a hard leash that prevents a job from running indefinitely due to a misconfigured patience or an unlucky pattern of tiny, barely significant improvements. If the run reaches that elapsed time, it ends cleanly, saving whatever the best checkpoint is to date. The lower bound on the learning rate, $10^{-5}$, serves a different purpose: once the scheduler has halved the rate enough times to cross that floor, the loop concludes that meaningful progress is unlikely and stops rather than spending hours making microscopic updates that do not move validation. These bounds make the training process predictable on shared resources: you know it will either converge by improving the validation loss or exit within specified time and rate limits.

Patience for early stopping mirrors the scheduler’s patience at fifty epochs, which ties the two mechanisms together. In a typical run you will see a cycle: the validation loss descends, flattens, the scheduler halves the learning rate, and descent resumes for a while. After one or two such drops, improvements fall below the delta threshold; the validation curve becomes effectively flat; patience counts down; and early stopping halts the training with the best checkpoint saved. Because both mechanisms read the same metric, model selection, learning-rate adaptation, and stopping criteria remain aligned. That alignment is important: optimizing on one quantity while scheduling or selecting on another invites perverse behavior where the loop continues to change the model even though the objective you care about has already stopped improving.

There are two practical tuning levers if you want to adjust the temperament. If your validation curve is visibly noisy despite the EMA, lengthen the patience so the scheduler and stopper ignore short-term wobble, or increase the delta slightly so only clear wins reset the clocks. If, on the other hand, the curve descends smoothly but slowly, shorten patience or increase the drop factor to reach finer learning rates earlier. Always read these settings in the context of your batch size and dataset size: smaller batches make plateaus harder to diagnose without an EMA, while very small validation sets make delta thresholds more important than patience. With the values here, the loop is cautious but decisive: it gives the optimizer time to make headway, turns the learning rate down only after sustained stagnation, and ultimately stops when further computation would be indistinguishable from drift.


# 8 Logging


Logging is how you turn a training run into a record you can understand, compare, and reproduce. This small block sets the tone for that record. The `verbose` key controls how much the trainer says out loud while it works. In `debug` mode, you will see the full stream: configuration echoes, shapes and counts, dataset summaries, per-epoch metrics, scheduler events, early-stopping decisions, and occasional warnings from the dataloader or optimizer. This is the right choice while you’re wiring up a new dataset, validating units, or running ablations, because it exposes the “why” behind the curves. If you’re launching long jobs on shared hardware, you can dial it back to `info` to keep logs readable without losing epoch-level metrics; `warning` and `error` are best reserved for production pipelines where only anomalies should surface. Whichever level you choose, remember that logs are part of your experiment’s provenance: they capture not just results but also the path the optimizer took to reach them.

The `wandb` switch introduces external experiment tracking. When it is `true`, the trainer streams metrics, configuration, and artifact pointers to Weights & Biases, letting you compare runs, overlay curves, and annotate decisions in a web dashboard. For hyperparameter tuning and model selection this is hard to beat: you can sort by validation loss, inspect learning-rate schedules post hoc, and retrieve the exact YAML and checkpoint associated with a promising curve. Because Allegro models are often sensitive to details like cutoff, multiplicity, or EMA decay, having a single timeline that links those choices to outcomes shortens the loop between idea and evidence. Turning `wandb` off, as here, is perfectly reasonable while you iterate locally, share logs via the run directory, or work without network access.

If and when you enable external tracking, the optional `wandb_project` name becomes the organizational handle under which runs are grouped. Using a consistent project string for a given dataset or study keeps the comparison set coherent; changing the project when you alter data distribution or label source prevents accidental apples-to-oranges overlays. In collaborative settings, a project also acts as a lightweight lab notebook: teammates can tag runs, pin best checkpoints, and add brief notes about what changed. Two practical considerations come with the territory. First, there is a small amount of overhead from emitting metrics every step or epoch; on modern hardware it is rarely the bottleneck, but if you chase absolute throughput you can reduce logging frequency. Second, cloud logs are only as trustworthy as what you push, so make sure you export consistent units and that your seeds and split policies are recorded alongside the curves; otherwise, brilliant-looking runs become hard to interpret later.

In short, verbosity governs the narrative in your local logs, while the Weights & Biases toggle decides whether that narrative is also mirrored into a searchable, shareable timeline. Begin with `debug` to ensure the pipeline is sound; once you are confident in the data and configuration, consider enabling W&B with a deliberate project name so your future self—and your collaborators—can see not just that a model worked, but how you got there.





# Training.yaml





```yaml title:"training.yaml"
# ============================================================================
# Allegro / NequIP training config (reorganized)
# Safe to reorder sections; lists' internal order matters.
# For full option reference: nequip/configs/full.yaml
# ============================================================================

# ---------------------------------------------------------------------------
# 1) RUN SCAFFOLDING — paths, reproducibility, dtype
# ---------------------------------------------------------------------------
root: results/Li3PS4-RANDOM              # run root; will create root/{process,run_name}
run_name: run_Li3PS4-RANDOM              # checkpoints + logs; timestamped if already exists

seed: 123456                             # model init seed (weights, etc.)
dataset_seed: 123456                     # dataset sampling/ordering seed
append: true                             # keep writing to existing log on resume
default_dtype: float64                   # numeric precision (float32 | float64)

# ---------------------------------------------------------------------------
# 2) DATA — loader backend, file, species mapping
# ---------------------------------------------------------------------------
dataset: ase                             # prefer ASE + extxyz for simplicity
dataset_file_name: sitraj_1.xyz
ase_args:
  format: extxyz

# Map symbols to internal type indices (required if input has atomic numbers)
chemical_symbol_to_type:
  Si: 0

# ---------------------------------------------------------------------------
# 3) MODEL — Allegro core, geometric field-of-view, features, MLPs
# ---------------------------------------------------------------------------
model_builders:
  - allegro.model.Allegro                # Allegro core
  - PerSpeciesRescale                    # per-species rescaling (common NequIP utility)
  - ForceOutput                          # add force head via E gradients
  - RescaleEnergyEtc                     # energy/force rescale utilities

# Neighborhood / cutoff
r_max: 6.0                               # radial cutoff (Å or dataset length units)
avg_num_neighbors: auto                  # auto precompute for normalization

# Radial basis & cutoff envelope
BesselBasis_trainable: true              # learn Bessel roots
num_bessels_per_basis: 8                 # radial channels
num_tensor_features: 8                   # Allegro latent tensor width per channel
PolynomialCutoff_p: 6                    # smooth cutoff envelope power

# Angular resolution & symmetry
l_max: 2                                 # max spherical harmonics order (1 fast, 2 typical)
parity: o3_full                          # E(3) equivariance choice: o3_full | o3_restricted | so3

# Depth/width
num_layers: 2                            # Allegro tensor-product layers (1–3 common)
env_embed_multiplicity: 8                # feature multiplicity; ↑ => more capacity
embed_initial_edge: true                 # include raw edge embedding

# Two-body embedding MLP (cheap; good place to add capacity)
two_body_latent_mlp_latent_dimensions: [128, 256, 512, 1024]
two_body_latent_mlp_nonlinearity: silu
two_body_latent_mlp_initialization: uniform

# Latent MLP over scalar features
latent_mlp_latent_dimensions: [1024, 1024, 1024]
latent_mlp_nonlinearity: silu
latent_mlp_initialization: uniform
latent_resnet: true                      # ResNet update in latent scalar space

# Environment-embedding MLP (often best left empty = linear layer)
env_embed_mlp_latent_dimensions: []
env_embed_mlp_nonlinearity: null
env_embed_mlp_initialization: uniform

# Final per-edge energy head (maps Allegro latent -> edge energies)
edge_eng_mlp_latent_dimensions: [128]
edge_eng_mlp_nonlinearity: null
edge_eng_mlp_initialization: uniform

# ---------------------------------------------------------------------------
# 4) TRAIN/VAL REGIMEN — split sizes, ordering, batching, epochs
# ---------------------------------------------------------------------------
n_train: 15                              # number of training structures
n_val: 8                                 # number of validation structures
train_val_split: sequential              # sequential | random (sequential uses file order)
shuffle: false                           # data loader shuffle (usually true is best)
batch_size: 2                            # small batches recommended when training on forces
max_epochs: 1000000                      # hard cap; early stopping will trigger first

# ---------------------------------------------------------------------------
# 5) OPTIMIZATION — optimizer, base LR, EMA of weights
# ---------------------------------------------------------------------------
learning_rate: 0.001                     # typical: 5e-4 .. 2e-3
optimizer_name: Adam
optimizer_params:
  amsgrad: false
  betas: !!python/tuple [0.9, 0.999]
  eps: 1.0e-08
  weight_decay: 0.0

# Exponential Moving Average (stabilizes val energy esp.)
use_ema: true
ema_decay: 0.99                          # 0.99 or 0.999 are common
ema_use_num_updates: true                # bias correction using step count

# ---------------------------------------------------------------------------
# 6) LOSS & METRICS — what we optimize and what we report/save on
# ---------------------------------------------------------------------------
# Weighted multi-task loss; energy via per-atom MSE to balance with forces
loss_coeffs:
  forces: 1.0
  total_energy:
    - 1.0
    - PerAtomMSELoss

# Metrics to log; these names also appear in the progress header
metrics_components:
  - [forces, mae]
  - [forces, rmse]
  - [forces, mae,  {PerSpecies: true, report_per_component: false}]
  - [forces, rmse, {PerSpecies: true, report_per_component: false}]
  - [total_energy, mae]
  - [total_energy, mae, {PerAtom: true}]
  - [total_energy, rmse]
  - [total_energy, rmse, {PerAtom: true}]

# Model selection / LR scheduler target
metrics_key: validation_loss             # "train|validation" + "_loss|f_mae|f_rmse|e_mae|e_rmse"

# ---------------------------------------------------------------------------
# 7) LR SCHEDULER & EARLY STOPPING — when to slow down or stop
# ---------------------------------------------------------------------------
lr_scheduler_name: ReduceLROnPlateau     # drop LR when metric plateaus
lr_scheduler_patience: 50                # epochs without improvement before LR drop
lr_scheduler_factor: 0.5                 # multiplicative LR drop

# Early stopping criteria: stop when progress is too small for too long,
# or LR fell too low, or wall-clock exceeded.
early_stopping_delta:
  validation_loss: 1.0e-4                # minimal improvement to count as progress
early_stopping_cumulative_delta: false
early_stopping_upper_bounds:
  cumulative_wall: 604800.0              # 7 days in seconds
early_stopping_lower_bounds:
  LR: 1.0e-5
early_stopping_patiences:
  validation_loss: 50

# ---------------------------------------------------------------------------
# 8) LOGGING — verbosity & W&B (optional)
# ---------------------------------------------------------------------------
verbose: debug                           # debug | info | warning | error
wandb: false                             # turn on to log to Weights & Biases
# wandb_project: Li3PS4-crystalline-datasize1000
```

A couple of tiny “gotchas” to keep in mind:

*   **Key names must stay exact.** Libraries only care about keys/values, not where you place them. If you ever see a “unknown key” error after reorg, it’s almost always a spelling mismatch.
    
*   **List order is meaningful.** Don’t reorder within `model_builders`, `metrics_components`, or optimizer tuples unless you intend to change behavior.
    
*   **`train_val_split` + `shuffle`.** With `sequential` + `shuffle: false`, validation will be the _next_ `n_val` frames after training, and epochs iterate in file order. For fairer validation, consider `random` + `shuffle: true` later.
    
