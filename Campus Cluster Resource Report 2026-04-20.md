# Campus Cluster Resource Report — 2026-04-20

This note summarizes a live probe of the Illinois campus cluster performed on April 20, 2026 from the login node `cc-login1`. The goal was to establish what kinds of nodes are actually available, how memory is accounted for by Slurm, whether interactive jobs are allowed, and whether a VASP-capable MPI and math-library stack is present. Because you said you usually use the `secondary`, `eertekin`, and `mrsec` partitions, I emphasize those where possible.

The main result is that the cluster is heterogeneous rather than uniform. The `secondary` partition spans multiple CPU-only and GPU node classes, with CPU counts ranging from 40 to 192 and memory tiers around 192 GB, 256 GB, 512 GB, 1 TB, 2 TB, and 4 TB. The `eertekin` and `mrsec` partitions appear to be carved from subsets of those same hardware pools rather than representing totally distinct hardware families. Interactive jobs are allowed. The software environment includes Intel compilers, Intel MPI, MKL, and OpenMPI, but I did not find a `vasp` module in the filtered module listing. One small systems note is that `rg` is not installed on the login node, so `grep -E` is the safer portable choice for quick filtering there.

## High-level interpretation

The `secondary` partition is the broad general-use partition and contains several hardware classes. In the sampled scheduler view it included classic 40-core Intel nodes with about 192 GB or 384 GB RAM, 64-core nodes with 256 GB, 512 GB, 1 TB, or even 4 TB RAM, 96-core and 128-core nodes in multiple memory tiers, and some GPU-backed variants with A30, A40, A100, H100, Tesla T4, V100, and RTX A6000 devices. The advertised walltime on `secondary` was `4:00:00`.

The `eertekin` family appears to expose a narrower slice of the same node pool, including 40-core Intel CPU nodes and 64-core AMD nodes, with a longer `6-00:00:00` walltime. The `mrsec` partition also appears to be a subset partition rather than a distinct architecture class, with `3-00:00:00` walltime in the visible listing.

From a Slurm-policy standpoint, memory is tracked with `CR_CPU_MEMORY`, partition limits are enforced, and neither `DefMemPerNode` nor `MaxMemPerNode` is globally capped in the config dump. That means the real memory constraints are coming from node definitions and partition policy, not a simple cluster-wide default memory ceiling.

## Command outputs

### `sinfo -o "%P %D %c %m %G %l %f"`

```text
PARTITION NODES CPUS MEMORY GRES TIMELIMIT AVAIL_FEATURES
secondary 1 128 515500 (null) 4:00:00 m512G,AE7713,25g,AE7713_25g_512G_NoGPU,amd
secondary 1 64 1031410 (null) 4:00:00 m1TB,G8358,NoGPU,25g,G8358_25g_1TB_NoGPU,intel
secondary 1 64 515315 gpu:A100:4 4:00:00 m512G,G8358,A100,25g,G8358_25g_512G_A100,intel
secondary 17 128 515500 (null) 4:00:00 m512G,AE7713,100g,25G,AE7713_25g_512G_NoGPU,intel
secondary 5 96 1031000 gpu:H100:8 4:00:00 m1T,G84688,H100,100g,G8468_100g_1TB_H100,intel
secondary 1 128 2051645 (null) 4:00:00 m1TB,AE7713,25g,HDR,AE7713_25g_2T_NoGPU,amd
secondary 6 64 515000 (null) 4:00:00 intel,emeraldrapids,NoGPU,100g
secondary 1 128 1031450 (null) 4:00:00 amd,E9534,noGPU,100g
secondary 1 96 257250 gpu:A30:2 4:00:00 inetl,emeraldrapids,A30,100g
secondary 11 128 515500 (null) 4:00:00 m512G,AE7713,100g,HDR,AE7713_100g_512G_NoGPU,amd
secondary 2 128 515580 gpu:TeslaT4:3 4:00:00 m512G,AE7702,TeslaT4,100g,HDR,AE7702_100g_512G_TeslaT4,amd
secondary 11 128 1031550 (null) 4:00:00 m1TB,AE7713,100g,HDR,AE7713_100g_1T_NoGPU,amd
secondary 2 128 257530 (null) 4:00:00 m256G,AE7713,25g,AE7713_25g_256G_NoGPU
secondary 1 96 515000 (null) 4:00:00 m512G,G84688,NoGPU,25g,G8468_25g_512G_NoGPU,intel
secondary 1 96 1031000 (null) 4:00:00 m1T,G84688,NoGPU,25g,G8468_25g_1TB_NoGPU,intel
secondary 4 96 257400 (null) 4:00:00 m256G,G84688,NoGPU,100g,G8468_100g_256G_NoGPU,intel
secondary 4 96 257000 (null) 4:00:00 intel,emeraldrapids,NoGPU,25g
secondary 2 96 257000 gpu:H100:1 4:00:00 intel,emeraldrapids,h100,25g
secondary 13 40 192960+ (null) 4:00:00 m192G,G6248,NoGPU,100g,HDR,G6248_100g_192G_NoGPU,intel
secondary 1 40 192960 gpu:V100:1 4:00:00 m192G,G6248,V100,100g,HDR,G6248_100g_192G_V100,intel
secondary 1 40 386490 (null) 4:00:00 m384G,G6248,NoGPU,100g,HDR,G6248_100g_384G_NoGPU,intel
secondary 3 40 192960 (null) 4:00:00 m192G,G6248,NoGPU,25g,E10G,G6248_25g_192G_NoGPU,intel
secondary 3 40 386500 (null) 4:00:00 m384G,G6248,NoGPU,25g,E10G,G6248_25g_384G_NoGPU,intel
secondary 5 64 257490 (null) 4:00:00 m256G,G8358,NoGPU,100g,HDR,G8358_100g_256G_NoGPU,amd
secondary 1 16 1019300 gpu:RTXA6000:2 4:00:00 m1T,A7313,RTXA6000,100g,HDR,amd
secondary 1 64 257300 gpu:A40:3 4:00:00 m256G,G8358,A40,100g,HDR,G8358_100g_256G_A40,amd
secondary 3 64 515315 (null) 4:00:00 m512G,G8358,NoGPU,25g,G8358_25g_512G_NoGPU,intel
secondary 32 64+ 257270 (null) 4:00:00 m256G,G8358,NoGPU,100g,HDR,G8358_100g_256G_NoGPU,intel
secondary 1 64 4128000 (null) 4:00:00 m4T,G8358,NoGPU,100g,HDR,G8358_100g_4T_NoGPU,intel
secondary 1 192 1031000 gpu:H100:8 4:00:00 m1T,G84688,H100,25g,G8468_25g_1TB_H100,intel
secondary-sg 1 128 257530 (null) 3-00:00:00 m256G,AE7713,100g,HDR,AE7713_100g_256G_NoGPU,amd
secondary-sg 6 128 515500 (null) 3-00:00:00 m512G,AE7713,100g,HDR,AE7713_100g_512G_NoGPU,amd
secondary-sg 2 128 515580 gpu:TeslaT4:3 3-00:00:00 m512G,AE7702,TeslaT4,100g,HDR,AE7702_100g_512G_TeslaT4,amd
secondary-sg 4 64 515300 (null) 3-00:00:00 intel,emeraldrapids,noGPU,100g
eertekin 5 40 193000 (null) 6-00:00:00 m192G,G6248,NoGPU,100g,HDR,G6248_100g_192G_NoGPU,intel
eertekin 1 64 257490 (null) 6-00:00:00 m256G,G8358,NoGPU,100g,HDR,G8358_100g_256G_NoGPU,amd
eertekin-amd 1 64 257490 (null) 6-00:00:00 m256G,G8358,NoGPU,100g,HDR,G8358_100g_256G_NoGPU,amd
eertekin-gpu 1 64 257300 gpu:A40:3 6-00:00:00 m256G,G8358,A40,100g,HDR,G8358_100g_256G_A40,amd
eertekin-intel 5 40 193000 (null) 6-00:00:00 m192G,G6248,NoGPU,100g,HDR,G6248_100g_192G_NoGPU,intel
eng-instruction 2 64 257200 gpu:A10:3 12:00:00 m256G,G8358,A10,100g,HDR,G8358_100g_256G_A10,intel
eng-instruction 3 128 1031550 (null) 12:00:00 m1TB,AE7713,100g,HDR,AE7713_100g_1T_NoGPU,amd
mrsec 1 128 257530 (null) 3-00:00:00 m256G,AE7713,100g,HDR,AE7713_100g_256G_NoGPU,amd
mrsec 4 64 515300 (null) 3-00:00:00 intel,emeraldrapids,noGPU,100g
scavenger 5 40 192960 gpu:QuadroRTX6000:8 1-00:00:00 m192G,G6248,QuadroRTX6000,100g,HDR,G6248_100g_192G_RTX6000,intel
scavenger 2 40 192960 (null) 1-00:00:00 m192G,G6248,NoGPU,25g,E10G,G6248_25g_192G_NoGPU,intel
```

### `scontrol show config | grep -Ei "DefMem|MaxMem|EnforcePartLimits|SelectTypeParameters"`

```text
DefMemPerNode           = UNLIMITED
EnforcePartLimits       = ALL
MaxMemPerNode           = UNLIMITED
SelectTypeParameters    = CR_CPU_MEMORY
```

### `module avail 2>&1 | grep -Ei "vasp|intel|impi|openmpi|mkl"`

```text
intel/advisor/latest
intel/advisor/2025.0                  (D)
intel/ccl/latest
intel/ccl/2021.14.0                   (D)
intel/compiler-intel-llvm/latest
intel/compiler-intel-llvm/2025.0.0
intel/compiler-intel-llvm/2025.0.4    (D)
intel/compiler-rt/latest
intel/compiler-rt/2025.0.0
intel/compiler-rt/2025.0.4            (D)
intel/compiler/latest
intel/compiler/2025.0.0
intel/compiler/2025.0.4               (D)
intel/debugger/latest
intel/debugger/2025.0.0               (D)
intel/dev-utilities/latest
intel/dev-utilities/2025.0.0          (D)
intel/dnnl/latest
intel/dnnl/3.6.0
intel/dnnl/3.6.1                      (D)
intel/dpct/latest
intel/dpct/2025.0.0                   (D)
intel/dpl/latest
intel/dpl/2022.7                      (D)
intel/intel_ipp_intel64/latest
intel/intel_ipp_intel64/2022.0        (D)
intel/intel_ippcp_intel64/latest
intel/intel_ippcp_intel64/2025.0      (D)
intel/mkl/latest
intel/mkl/2025.0                      (D)
intel/mpi/latest
intel/mpi/2021.14                     (D)
intel/tbb/latest
intel/tbb/2022.0                      (D)
intel/umf/latest
intel/umf/0.9.0
intel/umf/0.9.1                       (D)
intel/vtune/latest
intel/vtune/2025.0                    (D)
openmpi/5.0.1-gcc-13.3.0              (L)
```

### `which mpirun` and `which srun`

```text
/sw/apps/mpi/openmpi/5.0.1/gcc/13.3.0/bin/mpirun
/usr/bin/srun
```

### `ulimit -a`

```text
real-time non-blocking time  (microseconds, -R) unlimited
core file size              (blocks, -c) unlimited
data seg size               (kbytes, -d) unlimited
scheduling priority                 (-e) 0
file size                   (blocks, -f) unlimited
pending signals                     (-i) 514861
max locked memory           (kbytes, -l) unlimited
max memory size             (kbytes, -m) unlimited
open files                          (-n) 1024
pipe size                (512 bytes, -p) 8
POSIX message queues         (bytes, -q) 819200
real-time priority                  (-r) 0
stack size                  (kbytes, -s) 8192
cpu time                   (seconds, -t) unlimited
max user processes                  (-u) 514861
virtual memory              (kbytes, -v) unlimited
file locks                          (-x) unlimited
```

## Example node detail

I chose `ccc0220` from the `sinfo -N -l` listing because it was idle at the time of sampling and belonged to the `scavenger` partition. It is a useful reference for one of the 40-core Intel CPU-only node classes.

### `scontrol show node ccc0220`

```text
NodeName=ccc0220 Arch=x86_64 CoresPerSocket=20
   CPUAlloc=0 CPUEfctv=40 CPUTot=40 CPULoad=0.00
   AvailableFeatures=m192G,G6248,NoGPU,25g,E10G,G6248_25g_192G_NoGPU,intel
   ActiveFeatures=m192G,G6248,NoGPU,25g,E10G,G6248_25g_192G_NoGPU,intel
   Gres=(null)
   NodeAddr=ccc0220 NodeHostName=ccc0220 Version=25.05.7
   OS=Linux 5.14.0-570.106.1.el9_6.x86_64
   RealMemory=192960 AllocMem=0 FreeMem=170563 Sockets=2 Boards=1
   MemSpecLimit=8192
   State=IDLE ThreadsPerCore=1 TmpDisk=0 Weight=5 Owner=N/A MCS_label=N/A
   Partitions=scavenger
   BootTime=2026-04-15T14:15:38 SlurmdStartTime=2026-04-20T09:55:15
   LastBusyTime=2026-04-20T15:55:46 ResumeAfterTime=None
   CfgTRES=cpu=40,mem=192960M,billing=40
   AllocTRES=
   CurrentWatts=0 AveWatts=0
```

## Interactive allocation check

Interactive jobs are allowed. The command

```text
srun -p scavenger -N 1 -n 1 --time=00:10:00 --pty bash
```

queued briefly and was then allocated on `ccc0220`. That means you can use short interactive sessions for hardware inspection or debugging, at least on an accessible partition such as `scavenger`.

### `lscpu`

```text
Architecture:                x86_64
CPU(s):                      40
Vendor ID:                   GenuineIntel
Model name:                  Intel(R) Xeon(R) Gold 6248 CPU @ 2.50GHz
Thread(s) per core:          1
Core(s) per socket:          20
Socket(s):                   2
NUMA node(s):                2
NUMA node0 CPU(s):           0-19
NUMA node1 CPU(s):           20-39
```

### `free -h`

```text
               total        used        free      shared  buff/cache   available
Mem:           188Gi        22Gi       166Gi        13Gi        14Gi       165Gi
Swap:             0B          0B          0B
```

### `numactl --hardware`

```text
available: 2 nodes (0-1)
node 0 cpus: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19
node 0 size: 96303 MB
node 0 free: 89821 MB
node 1 cpus: 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
node 1 size: 96759 MB
node 1 free: 80430 MB
node distances:
node     0    1
   0:   10   21
   1:   21   10
```

## What this means for VASP-style work

If the immediate question is whether the cluster can support VASP-like MPI jobs, the answer is provisionally yes from an infrastructure standpoint. MPI launch tools exist, Intel MPI and MKL are available, and OpenMPI is on the current login-node path. What is not yet confirmed from this probe is whether a site-supported `vasp` module exists under another name, whether you are expected to bring your own build, or whether there is a private group installation outside the generic module tree.

For CPU-heavy VASP runs, the 40-core Intel nodes and the 64-core or 128-core CPU-only nodes in `secondary`, `eertekin`, and `mrsec` are the obvious targets, but the exact request should depend on whether your job benefits more from per-core memory, total memory, or a newer CPU generation. Because the partitions are heterogeneous, it would be worth pinning jobs to specific feature classes once you know which node families actually perform best for your workload.

## Practical notes

`rg` is not installed on the login node. Any diagnostic snippets that assume `ripgrep` should be rewritten to use `grep -E` unless you first install `rg` in your own environment.

The most important scheduler fact for memory interpretation is `SelectTypeParameters = CR_CPU_MEMORY`. Memory is therefore part of the tracked consumable-resource model, so node selection and memory requests should be treated carefully when translating benchmark results into production Slurm scripts.

## Follow-up questions worth answering next

The next useful step would be to inspect one representative node from each of your main partitions rather than only one `scavenger` node. In practice that means sampling a typical `secondary` node, a typical `eertekin` node, and a typical `mrsec` node with `scontrol show node` and, if allowed, short `srun` sessions. That would tell you whether those partitions differ materially in CPU generation, NUMA shape, or memory bandwidth-relevant topology, or whether they mainly differ in allocation policy and walltime.
