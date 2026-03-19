




```bash
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




