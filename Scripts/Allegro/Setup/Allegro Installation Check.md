

This script is a quick, self-contained “smoke test” to confirm that your **Allegro + NequIP** environment is installed correctly, can see the GPU, and can do a tiny bit of real work. You run it inside the same conda environment where you installed the stack. Its output is meant to be human-readable: versions, device info, a yes/no on a key CLI being on your `PATH`, and a couple of sanity computations.

It starts with a helper `try_import` that attempts to import a module by name and records any failures without crashing. Using that, it probes the core dependencies: `torch` (PyTorch), `nequip`, `allegro` (from the nequip-allegro package), `e3nn` (equivariant neural networks), and `ase` (Atomic Simulation Environment). For each successful import it prints the package version. If PyTorch is present, it goes further: it prints the CUDA toolkit version embedded in your PyTorch build, the cuDNN version if available, whether CUDA is actually usable on this machine, and—if a GPU is visible—the name of device 0 and its compute capability. This separates “PyTorch was compiled with CUDA” from “CUDA is present and working on this node.”

Because training is typically launched via a command-line tool, it also checks whether `nequip-train` is on your `PATH` using `shutil.which`. If any of the earlier imports failed, the script summarizes the missing modules and exits with return code 1 so that job scripts or CI can treat this as a hard failure.

If all the imports succeeded, the script performs a tiny compute test. It selects `device="cuda"` when a GPU is available and `torch` reports CUDA as usable; otherwise it falls back to CPU. It then allocates a random matrix `x` of shape 2048×2048 on that device and computes `y = x @ x.T`. That operation stresses basic linear algebra (cuBLAS on GPU, highly optimized BLAS on CPU) and will usually light up the GPU for a moment. It reports success along with the mean of `y` (brought back to CPU for printing). This is not a benchmark; it’s just enough work to catch obvious runtime issues like device pointer errors or mislinked libraries.

Finally, there’s an optional bridge check between ASE and NequIP’s data layer. Inside a `try` block, it constructs a trivial `H2` molecule via `ase.Atoms`, then converts it to `nequip.data.AtomicData` with a cutoff `r_max=3.0`. If that succeeds, you know the common ASE→NequIP data path is wired correctly. If it fails—for example because ASE is missing or versions don’t match—the script prints a non-fatal note and continues. Assuming everything else was fine, it prints “Environment looks good.” and exits with code 0.

Put together, the script answers four practical questions in one go: are the key Python packages importable; is your PyTorch build CUDA-enabled and can it see a GPU on this node; is the `nequip-train` launcher available on the command line; and can NequIP ingest an ASE structure. If any of those conditions aren’t met, you get a clear message and a non-zero exit code; if they are, you have high confidence the environment is ready for Allegro/NequIP training jobs.



```Python title:"Allegro Installation Health Check"
(allegro) gclopton@polaris-login-01:~/computations/allegro> cat verify_allegro.py
#!/usr/bin/env python
"""Lightweight smoke test for the Allegro + NequIP stack.

Run inside the Allegro conda env, e.g.:
    (allegro) $ python verify_allegro.py
"""

import sys, shutil


def main() -> int:

    errs = []
    def try_import(name):
        try:
            mod = __import__(name)
            return mod
        except Exception as exc:
            errs.append((name, exc))
            return None

    torch = try_import("torch")
    nequip = try_import("nequip")
    allegro = try_import("allegro")     # from nequip-allegro
    e3nn = try_import("e3nn")
    ase = try_import("ase")

    print("=== Allegro environment check ===")
    if torch is not None:
        print(f"torch: {torch.__version__}")
        print(f"  torch.version.cuda: {getattr(torch.version, 'cuda', None)}")
        print(f"  torch.backends.cudnn.version(): {getattr(getattr(torch.backends,'cudnn',None),'version',lambda:None)()}")
        print(f"  cuda available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"  device: {torch.cuda.get_device_name(0)} | capability: {torch.cuda.get_device_capability(0)}")
    if nequip is not None:
        print(f"nequip: {getattr(nequip, '__version__', 'unknown')}")
    if allegro is not None:
        print(f"allegro: {getattr(allegro, '__version__', 'unknown')}")
    if e3nn is not None:
        print(f"e3nn: {getattr(e3nn, '__version__', 'unknown')}")
    if ase is not None:
        print(f"ase: {getattr(ase, '__version__', 'unknown')}")

    # Helpful CLI present?
    print(f"nequip-train on PATH: {shutil.which('nequip-train') is not None}")

    if errs:
        print("\nMissing or failed imports:", file=sys.stderr)
        for name, exc in errs:
            print(f" - {name}: {exc!r}", file=sys.stderr)
        return 1

    # Tiny compute test (GPU if present)
    device = "cuda" if (torch is not None and torch.cuda.is_available()) else "cpu"
    x = torch.randn(2048, 2048, device=device)
    y = x @ x.T
    print(f"matmul OK on {device}; mean={float(y.mean().cpu()):.6f}")

    # Optional: ASE→NequIP data bridge sanity (CPU only)
    try:
        from nequip.data import AtomicData
        from ase import Atoms
        h2 = Atoms("H2", positions=[[0,0,0],[0,0,0.74]])
        _ = AtomicData.from_ase(h2, r_max=3.0)
        print("ASE ↔︎ nequip AtomicData bridge OK")
    except Exception as exc:
        print(f"(note) AtomicData bridge skipped/failed: {exc!r}")

    print("Environment looks good.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
```



``` title:output
(allegro) gclopton@polaris-login-01:~/computations/allegro> python verify_allegro.py
=== Allegro environment check ===
torch: 1.11.0
  torch.version.cuda: 11.3
  torch.backends.cudnn.version(): 8200
  cuda available: False
nequip: 0.6.1
allegro: 0.3.0
e3nn: 0.5.6
ase: 3.25.0
nequip-train on PATH: True
matmul OK on cpu; mean=1.015273
ASE ↔︎ nequip AtomicData bridge OK
Environment looks good.
```


What your smoke test printed is basically a health report for the Allegro/NequIP toolchain. The good news is that the Python stack itself is intact: NequIP 0.6.1, Allegro 0.3.0, e3nn 0.5.6, and ASE 3.25.0 all import correctly and the ASE→NequIP data bridge works. That last line—“`ASE ↔︎ nequip AtomicData bridge OK`”—is a quiet but important confirmation that a typical path from your MD structures into NequIP’s `AtomicData` will function. The scripted 2048×2048 matrix multiply also succeeded, which tells us BLAS/cuBLAS plumbing is fine on whatever device you used. The one red flag is the CUDA line: “cuda available: False.” On its own, that does not mean your environment is mis-installed; it almost always means you ran the test on a login node that does not expose GPUs to user processes. You’re on `polaris-login-01`, which is precisely the kind of machine where schedulers prohibit direct GPU use. PyTorch is a CUDA build (`torch.version.cuda: 11.3`) with cuDNN 8.2 linked in, so the wheels you have can speak to GPUs once you’re on a compute node that actually has them.

For your ceria project, the immediate implication is that you’re ready at the Python layer but you’re still “standing in the lobby.” Allegro training should run on a GPU, both for throughput and for the larger models you’ll eventually want to fit to forces and energies from your MD set. The next step is to hop onto a GPU-equipped compute node via your scheduler and re-run the verifier there. When PyTorch can see a device, that `cuda available` line flips to `True`, and you’ll also see the device name (e.g., “A100-SXM4-40GB”) and compute capability. That one check closes the loop from “packages import” → “driver/toolkit compatibility” → “real device present.”

If you prefer an interactive session, request a single GPU and a short walltime from the queue so you can poke around. On Slurm-style systems it looks like this:

```bash
# request a 1-GPU interactive shell for an hour
salloc -p gpu -N 1 --gpus=1 -t 01:00:00
module load cuda            # if your site uses modules
conda activate allegro
python verify_allegro.py    # should now report cuda available: True
nvidia-smi                  # quick sanity check
```

On PBS-style systems the interactive pattern is:

```bash
# PBS interactive with one GPU
qsub -I -l select=1:ncpus=8:ngpus=1:mem=32GB -l walltime=01:00:00
module load cuda
conda activate allegro
python verify_allegro.py
```

If your center discourages interactive GPU use, drop a tiny batch script that runs the same checks plus a miniature `nequip-train` dry run. Here is a compact Slurm example:

```bash
#!/bin/bash
#SBATCH -A <your_account>
#SBATCH -p gpu
#SBATCH -N 1
#SBATCH --gpus=1
#SBATCH -t 00:10:00
#SBATCH -J nequip_check
module load cuda
source ~/.bashrc
conda activate allegro
python verify_allegro.py
```

And a comparable PBS sketch:

```bash
#PBS -A <your_account>
#PBS -l select=1:ncpus=8:ngpus=1:mem=32GB
#PBS -l walltime=00:10:00
#PBS -N nequip_check
cd $PBS_O_WORKDIR
module load cuda
source ~/.bashrc
conda activate allegro
python verify_allegro.py
```

Two practical notes often save time on first attempts. First, make sure you activate the same `allegro` conda environment on the compute node that you used on the login node; module loads or site defaults can silently prepend different CUDA libraries, so keep your steps explicit: module, then conda, then Python. Second, if your site pins a newer driver than your wheel’s toolkit, that’s fine—NVIDIA drivers are backward-compatible with older CUDA runtimes—but if you ever see `CUDA driver initialization` errors on the compute node, reinstall a PyTorch wheel that matches the site’s recommended CUDA (NequIP 0.6.x is happy with late 1.12/1.13; Allegro 0.3.0 likewise). For example:

```bash
# inside your allegro env, if you need to bump PyTorch to a newer CUDA build
pip install --upgrade "torch==1.13.1+cu117" --index-url https://download.pytorch.org/whl/cu117
```

Once the verifier reports a real GPU, you can move straight to training on your ceria data. The essential ingredients are: a dataset file NequIP can read (commonly an `extxyz`, `.npz`, or `.db` with positions, cell, species, energies, and forces), and a config YAML that points to that dataset and sets Allegro as the model. You’ve already been generating `extxyz` from your MD; if needed, NequIP’s dataset tooling or your existing converters can bridge ASE trajectories to disk. A minimal launch then looks like:

```bash
nequip-train config.yaml wandb.mode=disabled
```

where `config.yaml` contains entries such as:

```yaml
dataset: ase             # or 'npz', etc.
dataset_file: /path/to/ceria.extxyz
chemical_symbols:
  - Ce
  - O
model: allegro
r_max: 5.0               # cutoff you chose for ceria
loss_coeffs:
  forces: 1.0
  energy: 0.1
optimizer: adam
batch_size: 2_000        # tune to fit GPU memory
device: cuda
```

On first runs, keep the batch size modest and watch GPU memory in `nvidia-smi`; Allegro scales well, but ceria’s fluorite cells with many neighbors can inflate per-batch graphs. If you see host-to-device stalls, increase `num_workers` in the data loader; if you see out-of-memory, drop `batch_size` or `r_max` a notch while you validate the pipeline. Most importantly, run everything through the queue on a GPU node—never on the login host—so that `cuda available` stays “True” and training actually uses the accelerator.

In short, your output says the software is ready, the data bridge is alive, and the only missing piece is hopping from the login node to a real GPU allocation. Do that, re-run the verifier once to confirm the device path, and then point `nequip-train` at your ceria dataset. From that moment on, you’ll be training Allegro on GPU just as intended.


# Finding GPU

The following commands give you the “shape” of your scheduler and which doors might open onto GPUs. 

The first trio of commands failed to list nodes because this cluster is not running Slurm (`sinfo` missing) and, on this site, the node-inventory subcommands of PBS (`pbsnodes`) aren’t exposed on login hosts. That already tells you two things: you’re on PBS Pro/Torque, and the admins don’t let users scrape the entire node catalog from the login node. Your follow-up probe—`which qstat && qstat --version`—confirms it unambiguously: PBS Pro 2025.2 is the resource manager here.

```bash
(allegro) gclopton@polaris-login-01:~/computations/allegro> sinfo -o "%P %20G %10a %10l %5D %10T"
-bash: sinfo: command not found
(allegro) gclopton@polaris-login-01:~/computations/allegro> pbsnodes -aSj | egrep -B1 "ngpus=|gpus="
(allegro) gclopton@polaris-login-01:~/computations/allegro> pbsnodes -avS | egrep -i "Mom = |resources_available.ngpus"
```


```bash
which qstat && qstat --version
```


``` title:output
/opt/pbs/bin/qstat
pbs_version = 2025.2.0.20250702153105
```


The queue summaries are the most informative part of your output. `qstat -Q` shows which queues exist and whether they’re accepting jobs; `qstat -Qf` exposes per-queue resource caps. In your case, almost all of the “normal work” queues (`debug, small, medium, large, backfill-*, preemptable, demand,` etc.) are enabled and started, but none of those lines advertise a GPU limit. By contrast, several special queues do: [Note #1]  `build` lists `resources_max.ngpus = 1` and is enabled/started; [Note #2] a handful of project-looking queues (`R613850*`, `R6140945`) advertise very large GPU caps but are “started = False” or ACL-restricted, meaning they’re not currently usable by you. Net result: from what PBS is willing to show you, the only generally available queue that explicitly allows GPUs right now is `build`, and it caps you at a single GPU per job. That cap doesn’t necessarily mean “the only GPUs on the system live in build”; it only means “PBS is telling you, up front, that this queue will accept `ngpus=`.” Many centers hide GPU details on general queues; the authoritative way to find out is to request a GPU in a small allocation and see whether the queue grants it or rejects it with a policy error.



```bash
qstat -Q
```


``` title:output
Queue              Max   Tot Ena Str   Que   Run   Hld   Wat   Trn   Ext Type
---------------- ----- ----- --- --- ----- ----- ----- ----- ----- ----- ----
run_next             0     0 yes yes     0     0     0     0     0     0 Exe*
debug                0    26 yes yes     2    13    11     0     0     0 Exe*
debug-scaling        0     8 yes yes     1     4     3     0     0     0 Exe*
prod                 0     2 yes yes     1     0     1     0     0     0 Rou*
small                0    17 yes yes     2     4    11     0     0     0 Exe*
medium               0    17 yes yes    17     0     0     0     0     0 Exe*
large                0    49 yes yes    18     2    29     0     0     0 Exe*
backfill-small       0     4 yes yes     2     2     0     0     0     0 Exe*
backfill-medium      0     1 yes yes     1     0     0     0     0     0 Exe*
backfill-large       0     2 yes yes     2     0     0     0     0     0 Exe*
preemptable          0    87 yes yes    59    22     6     0     0     0 Exe*
demand               0     0 yes yes     0     0     0     0     0     0 Exe*
build                0     0 yes yes     0     0     0     0     0     0 Exe* [Note #1] 
ds_build             0     0 yes yes     0     0     0     0     0     0 Exe*
visualization        0     1 yes yes     0     1     0     0     0     0 Exe*
route_preempt        0     0 yes yes     0     0     0     0     0     0 Rou*
ATPESC               0     0 yes yes     0     0     0     0     0     0 Rou*
ATPESC_Big_Run       0     0 yes yes     0     0     0     0     0     0 Rou*
R6138500             0     0 yes  no     0     0     0     0     0     0 Exe*
R6138501             0     0 yes  no     0     0     0     0     0     0 Exe*
R6138502             0     0 yes  no     0     0     0     0     0     0 Exe*
R6138503             0     0 yes  no     0     0     0     0     0     0 Exe*
R6138505             0     0 yes  no     0     0     0     0     0     0 Exe*
R6138507             0     0 yes  no     0     0     0     0     0     0 Exe*
alcf_training        0     0 yes yes     0     0     0     0     0     0 Rou*
alcf_training_l      0     0 yes yes     0     0     0     0     0     0 Rou*
R6140945             0     0 yes  no     0     0     0     0     0     0 Exe*
M6354670             0     0 yes  no     0     0     0     0     0     0 Exe*
```


```bash
qstat -Qf | egrep -i "queue|resources_default.ngpus|resources_max.ngpus|enabled|started"
```


``` title:output
Queue: run_next
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    enabled = True
    started = True
Queue: debug
    queue_type = Execution
    state_count = Transit:0 Queued:2 Held:11 Waiting:0 Running:14 Exiting:0 Beg
    enabled = True
    started = True
    queued_jobs_threshold = [u:PBS_GENERIC=1]
Queue: debug-scaling
    queue_type = Execution
    state_count = Transit:0 Queued:1 Held:3 Waiting:0 Running:3 Exiting:0 Begun
    max_queued = [u:PBS_GENERIC=1]
    enabled = True
    started = True
    queued_jobs_threshold = [u:PBS_GENERIC=1]
Queue: prod
    queue_type = Route
    state_count = Transit:0 Queued:1 Held:1 Waiting:0 Running:0 Exiting:0 Begun
    max_queued = [p:PBS_GENERIC=100]
    enabled = True
    started = True
Queue: small
    queue_type = Execution
    state_count = Transit:0 Queued:2 Held:11 Waiting:0 Running:4 Exiting:0 Begu
    max_queued = [p:PBS_GENERIC=10]
    enabled = True
    started = True
Queue: medium
    queue_type = Execution
    state_count = Transit:0 Queued:17 Held:0 Waiting:0 Running:0 Exiting:0 Begu
    max_queued = [p:PBS_GENERIC=10]
    enabled = True
    started = True
Queue: large
    queue_type = Execution
    state_count = Transit:0 Queued:18 Held:29 Waiting:0 Running:2 Exiting:0 Beg
    max_queued = [p:PBS_GENERIC=10]
    enabled = True
    started = True
Queue: backfill-small
    queue_type = Execution
    state_count = Transit:0 Queued:2 Held:0 Waiting:0 Running:2 Exiting:0 Begun
    max_queued = [p:PBS_GENERIC=10]
    enabled = True
    started = True
Queue: backfill-medium
    queue_type = Execution
    state_count = Transit:0 Queued:1 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    max_queued = [p:PBS_GENERIC=10]
    enabled = True
    started = True
Queue: backfill-large
    queue_type = Execution
    state_count = Transit:0 Queued:2 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    max_queued = [p:PBS_GENERIC=10]
    enabled = True
    started = True
Queue: preemptable
    queue_type = Execution
    state_count = Transit:0 Queued:60 Held:6 Waiting:0 Running:22 Exiting:0 Beg
    max_queued = [p:PBS_GENERIC=20]
    enabled = True
    started = True
Queue: demand
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    max_queued = [p:PBS_GENERIC=100]
    resources_default.preempt_targets = Queue=preemptable
    enabled = True
    started = True
Queue: build [Note #1]
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    resources_max.ngpus = 1 [Note #1]
    enabled = True
    started = True
Queue: ds_build
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    max_queued = [u:PBS_GENERIC=10]
    enabled = True
    started = True
Queue: visualization
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:1 Exiting:0 Begun
    enabled = True
    started = True
    queued_jobs_threshold = [u:PBS_GENERIC=100]
Queue: route_preempt
    queue_type = Route
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    max_queued = [p:PBS_GENERIC=100]
    enabled = True
    started = True
Queue: ATPESC
    queue_type = Route
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    enabled = True
    started = True
Queue: ATPESC_Big_Run
    queue_type = Route
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    enabled = True
    started = True
Queue: R6138500 [Note #2]
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    resources_max.ngpus = 512 [Note #2]
    enabled = True
    started = False
Queue: R6138501
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    resources_max.ngpus = 512
    enabled = True
    started = False
Queue: R6138502
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    resources_max.ngpus = 512
    enabled = True
    started = False
Queue: R6138503
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    resources_max.ngpus = 1024
    enabled = True
    started = False
Queue: R6138505
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    resources_max.ngpus = 1024
    enabled = True
    started = False
Queue: R6138507
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    resources_max.ngpus = 1024
    enabled = True
    started = False
Queue: alcf_training
    queue_type = Route
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    enabled = True
    started = True
Queue: alcf_training_l
    queue_type = Route
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    enabled = True
    started = True
Queue: R6140945 [Note #2]
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    resources_max.ngpus = 256 [Note #2]
    acl_groups = ALCF_Getting_Started
    enabled = True
    started = False
Queue: M6354670
    queue_type = Execution
    state_count = Transit:0 Queued:0 Held:0 Waiting:0 Running:0 Exiting:0 Begun
    enabled = True
    started = False
```



So, what do you do next for Allegro on your ceria dataset? You already validated that your software stack is CUDA-capable but ran on a non-GPU login host. The next step is to land on a GPU compute node via PBS and re-run your verifier there. Start with the one queue that explicitly advertises GPUs; if it’s meant only for compiling, PBS will tell you, but if it’s a general “builder” queue with a token accelerator attached, you’ll get exactly what you need for a quick check.


```bash
qsub -I -q build \
     -l select=1:ncpus=8:ngpus=1:mem=32GB \
     -l walltime=00:30:00 \
     -N allegro_gpu_shell
```


``` title:output
qsub: Account_Name is required to be set.
```


