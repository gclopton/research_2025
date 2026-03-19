# USER-EPH (LAMMPS extension) — GitHub repository

LAMMPS extension to capture electron-ion interaction. This is a mirror of https://gitlab.com/artuuuro/USER-EPH.
GPL-3.0 license
18 stars
ध 8 forks
6 watching
Branches
Activity
Custom properties
Tags
Public repository

37 Branches
7 Tags
↷
Go to file
Go to file
Add file
Code
◯ Artur Tamm fixed a minor logic bug
a836eb2 $\cdot 11$ months ago

| - Data | small fixes | 3 years ago |
| :--- | :--- | :--- |
| - Doc | Updated changes from github repo | 7 years ago |
| - Examples | Added README | 7 years ago |
| - Install | Added missing files | 7 years ago |
| - TB_Bench | Minor things | 7 years ago |
| - Temp | Added utility for creating kappa file | 5 years ago |
| - Tests | Fixed warning prints | 3 years ago |
| - lib | Working on fdm part | 7 years ago |
| - utils/kappa | Heat diffusion is implemented, nee... | 5 years ago |
| 0 .gitignore | Bug fix atoi -> strtol | 8 years ago |
| - CHANGELOG | CHANGELOG has versions but no ... | 9 years ago |
| - LICENSE | Initial commit | 9 years ago |
| 0 README.md | fixed a typo | 3 years ago |
| TODO | Added an aspect to think about | 6 years ago |
| - eph_beta.h | Fixed warning prints | 3 years ago |
| - eph_fdm.h | cleanup | 5 years ago |
| - eph_gpu.h | work on GPU | 7 years ago |
|  | more work is necessary for fix_eph... | 5 years ago |

eph_kappa.h
eph_linear.h
more work is necessary for fix_eph...
5 years ago
eph_spline.h
more work is necessary for fix_eph...
5 years ago
fix_eph.cpp
fixed a minor logic bug
11 months ago
fix_eph.h
more work is necessary for fix_eph...
5 years ago
fix_eph_atomic.cpp
fixed compilation issue with new la...
3 years ago
fix_eph_atomic.h
fixed all bugs
5 years ago
fix_eph_coloured.cpp
fixed compilation issue with new la...
3 years ago
fix_eph_coloured.h
Working on the exp version coloure...
5 years ago
fix_eph_coloured_exp.cpp
fixed compilation issue with new la...
3 years ago
fix_eph_coloured_exp.h
Found an issue and fixed it
5 years ago
fix_eph_coloured_exp_v1.cpp
fixed compilation issue with new la...
3 years ago
fix_eph_coloured_exp_v1.h
We have two approaches for memo...
5 years ago
fix_eph_gpu.cpp
Temperature dependent FDM
7 years ago
fix_eph_gpu.h
Fixed a bug with grow_arrays
7 years ago

README
GPL-3.0 license

## USER-EPH

LAMMPS extension (LAMMPS "fix") to capture electron-ion interaction and electronic stopping. LLNL-CODE750832

Artur Tamm (University of Tartu) [artur.tamm@ut.ee](mailto:artur.tamm@ut.ee) Alfredo A. Correa (LLNL) [correaa@llnl.gov](mailto:correaa@llnl.gov)

## Updates/News

I am planning to refactor the code a bit, so that it would be easier to expand the capabilities of the code in the future. The old codebase will be saved under the tag legacy-2023-11-22.

You can clone the legacy code with this command (you will see warnings about being in a detached state, but you can ignore them):
git clone -b legacy-2023-11-22 https://gitlab.com/artuuuro/USER-EPH.git

Some planned changes:

- Move to json format for inputs. This will enable to extend the input files without breaking older implementations. The json implementation will be based on nlohmann::json as it is low overhead and does not require any additional dependencies.
- Remove old GPU implementation from the master branch
- Rewrite the documentation
- Create EPH parameterisations based on Leonid Zhigilei's data
- Create EPH parameterisations based on Nikita Medvedev's data


## Introduction

In LAMMPS, a "fix" is a plugin or extension to the main code that performs a specific operation on the atomistic system during time-stepping or minimization. We use this extension mechanism to generalize the two-temperature model to include electron-phonon coupling. The fix implements a theory to model collision cascades, laser heating, and equilibration and to study energy transport, incorporating realistic electronic stopping power and electron-phonon coupling. The theory is developed in the papers "Langevin dynamics with spatial correlations as a model for electron-phonon coupling" (https://dx.doi.org/10.1103/PhysRevLett.120.185501) and "Electron-phonon interaction within classical molecular dynamics" (https://link.aps.org/doi/10.1103/PhysRevB.94.024305).


## Installation Instructions

First you need a version of LAMMPS (source code)

```
$ mkdir mywork
$ cd mywork
$ git clone https://github.com/lammps/lammps.git
```


## Compile the USER-EPH fix for CPUs

Get USER-EPH (this plugin, you have to have access to the repository)

```
$ cd lammps/src
$ git clone https://github.com/LLNL/USER-EPH.git
```

Edit LAMMPS' Makefile add the string user-eph to the PACKUSER variable (near line 68), for example:

```
PACKUSER = user-adios user-atc user-awpmd user-bocs user-cgdna user-cgsdk user-colvars \
    ...
    user-sdpd user-sph user-tally user-uef user-vtk user-yaff \
    user-eph
```

Edit MAKE/Makefile.mpi and MAKE/Makefile.serial and add $-\mathrm{std}=\mathrm{c}++11$ to the CCFLAGs varialbe to read CCFLAGS $=-\mathrm{g}-03-\mathrm{std}=\mathrm{c}++11$ (near line 10).

## Execute:

```
$ make yes-manybody yes-user-eph
$ make -j 8 serial
```

(You can also enable other packages as needed)
Make sure your MPI enviroment is setup already ( mpicxx compiler wrapper works), this may require for example running \$ module load mpi/mpich-x86_64

```
$ make -j 8 mpi
```

The executables are ./lmp_mpi (for parallel runs) ./lmp_serial (for serial runs, testing), you can copy them elsewhere.

## Compile for CUDA-enabled GPUs (optional)

The code is ported to GPUs, a CUDA toolkit is required to compile this version and a CUDA card(s) supporting architecture at least 6.0 ( sm_60, like Pascal, Volta, Turing, etc. The command nvidia-smi will give you details.

If not defined, set the CUDA environment variable (e.g. /usr/local/cuda or /usr )

```
$ echo $CUDA_HOME
$ export CUDA_HOME=/usr/local/cuda
```

Go back to the LAMMPS GPU library directory ( cd . . . . ./lammps/lib/gpu ) and modify the file Makefile.linux.double add and activate your CUDA architecture and if needed CUDA_HOME and CUDA_INCLUDE . For example (after line 10),

```
...
#CUDA_HOME = /usr/local/cuda
NVCC = nvcc -ccbin=cuda-c++ ### or, for example -ccbin=mpicxx
# Kepler CUDA
#CUDA_ARCH = -arch=sm_35
# Tesla CUDA
# CUDA_ARCH = -arch=sm_21
# newer CUDA
#CUDA_ARCH = -arch=sm_13
# older CUDA
#CUDA_ARCH = -arch=sm_10 -DCUDA_PRE_THREE
# Pascal (your architecture)
CUDA_ARCH = -arch=sm_60
...
```

and compile the library and return to the USER-EPH

```
$ make -f Makefile.linux.double
```

Go to the USER-EPH directory

```
$ cd ../../../lammps/src/USER-EPH/lib
```

Modify Makefile if needed ( CUDA_ARCH, CUDA_CODE, NVCCFLAGS, INCFLAGS ) and load necessary modules (e.g. module load mpi/openmpi-x86_64 ) buid

```
$ make
```

Go back to the source directory lammps/src and create a new file MAKE/Makefile.mpi_gpu

```
$ cd ../..
$ cp MAKE/Makefile.mpi MAKE/Makefile.mpi_gpu
```

Modify the CCFLAGS and LIB variables in the new MAKE/Makefile.mpi_gpu to read

```
...
CCFLAGS = -g -03 -std=c++11 -DFIX_EPH_GPU
...
LIB = -L../USER-EPH/lib -leph_gpu -lcuda -lcudart
...
$ make yes-user-eph
$ make yes-gpu
$ make -j mpi_gpu
```

The GPU executable will be in lmp_mpi_gpu .

The use the GPU accelerated potentials you enable the GPU package when running LAMMPS either by supplying it on the command line or through run scripts.

```
$ cd USER-EPH/Examples/Example_5
$ lmp_mpi_gpu -pk gpu 1 -sf gpu -i run.lmp
```

or

```
# LAMMPS input file run.lmp
package gpu 1
...
pair eam/alloy/gpu
...
fix friction all eph/gpu
...
```

The -pk gpu 1 and -sf gpu flags allow the use of a single lammps run script where the last will try to substitute all fixes and pairs supporting gpu extension.

See also Example-5 for a possible input script using the GPU version.

## Note

The current GPU version of the fix is not multi-device aware, so in order to utilise all GPUs on a node, an equal number of tasks has to be used. Thus, mpirun has to be aware of gpus in order to assign correct GPUs to each task. As a workaround, GPUs can be set into a special mode to block multiple tasks running on one GPU card.

## Usage

- Take your MD input file
- Add a line at the correct place,

```
fix [ID] [group-ID] eph [seed] [flags] [model] [rho_e] [C_e] [kappa_e] [T_e] [NX] [NY]
[NZ] [T_infile] [freq] [Te_outfile] [beta_infile] [A] [B] [C...]
```

Where:

- ID -> user-assigned name for the fix, [string, e.g. ephttm or friction]
- group-ID -> group of atoms to which this fix will be applied, [string, e.g. all]
- seed -> seed for random number generator [integer, e.g. 123]
- flags : control of different terms or'd together [integer or bitmask]
- 1 -> enable friction (only) (pure damping)
- 2 -> enable random force (only) (not recommended)
- 3 -> enable friction and random force (fixed e-temperature)
- 4 -> heat equation (by FDM finite difference method) (decoupled from ions)
- 5 -> enable friction and heat equation (no feedback from e-)
- 7 -> enable friction, random force, and heat equation (coupled e-ions)
- model : select model for friction and random force [integer]
- 1 -> standard Langevin (for vanilla TTM with beta(rho))
- 2 -> simple e-ph model (https://link.aps.org/doi/10.1103/PhysRevB.94.024305) (not recommended)
- 3 -> e-ph with spatial correlations, with CM-correction only (https://arxiv.org/abs/1801.06610)
- 4 -> e-ph with spatial correlations, full model (https://arxiv.org/abs/1801.06610)
- rho_e -> scaling parameter for the FDM grid [float, recommended 1.0 ] [unitless]
- C_e -> electronic heat capacity per volume [float, e.g. 2.5e-6 ] [in eV/K/Ang^3]
- kappa_e -> electronic thermal conductivity [float, ignored for single grid point] [in eV/K/Ang/ps]
- T_e -> electronic temperature [float, e.g. 300 ] [in K]
- NX, NY, NZ -> grid size in $\mathrm{x}, \mathrm{y}$, and z direction [integer, e.g. 111 sets single grid point]
- T_infile -> input filename for the FDM grid parameters and initial values [string or NULL]
- freq -> heat map output ( T_output ) frequency, 0 to disable [integer, e.g. 10 ]
- Te_output -> output heat map filename (CUBE format) [string, e.g. Te_output.cub ]
- beta_infile -> beta(rho) input filename [string, e.g. NiFe.beta ]
- A , B , C... -> element type mapping [1 or more strings, Ni Ni Fe ]
~/Lassen/09_Techbase/TB_Bench/02_Bench/02_GPU/TB_12/02_2_nodes For example the following line in LAMMPS input script, will run the MD including the coupling to electrons, within the spatially correlated Langevin bath. The electronic specific heat is assumed to be $2.5 \mathrm{e}-6 \mathrm{eV} / \mathrm{K} / \mathrm{Ang}^{\wedge} 3\left(400000 \mathrm{~J} / \mathrm{m}^{3} / \mathrm{K}\right)($ see

LinPRB772008) which is a good approximation for a range of electronic temperatures from 500 to 1500 K . Initial electron temperature is set to 300 K (and not from a file). We use uniform tempetures (one grid element), therefore the heat conductivity is not relevant in this case.

```
fix ephttm all eph 1237 4 1.0 2.5e-6 1.0 300.0 1 1 1 NULL 10 Te_output.cub Ni.beta Ni
```

This fix produces two types of Lammps-internal results in addition to the normal MD:

- vector with the energy and temperature of the electronic system

```
- f_ID[1] -> Net energy transfer between electronic and ionic system
- f_ID[2] -> Average electronic temperature
```

- per atom values:

```
- f_ID[i][1] -> site density
- f_ID[i][2] -> coupling parameter
```

To access them in the output file add this to the LAMMPS input script:

```
fix out all print 1000 "$(step) $(time) $(temp) $(f_ephttm[1]) $(f_ephtmm[2])" file
out.data screen no
dump out all custom 10 strucs_out.dump.gz type x y z f_ephttm[1] f_ephttm[2]
```


## Beta(rho) input file

This file provides the electronic densities and beta(rho) functions for individual species (see https://dx.doi.org/10.1103/PhysRevLett.120.185501). The format is described in Doc/Beta/input.beta. The file is similar to EAM setfl format. The beta(rho) function has units of $\left[\mathrm{eV} \mathrm{ps} / \mathrm{Ang}{ }^{\wedge} 2\right]$. An example is provided in Examples/Beta/Ni_model_4.beta .

## heat equation FDM grid input file

This file is used to initialise FDM grid for the electronic system. The format is described in Doc/FDM/T_input.fdm . This allows fine control of the properties at various grid points. Also, the grid can be larger than ionic system if energy reservoir far away is needed. Grid points can act as energy sources, sinks or walls (individual grid points updates can be deactivated). An example of input file is provided in Examples/FDM/T.in. Units are [Kelvin], [eV/Ang^3/ps], [unitless], [in eV/K/Ang^3] [eV/K/Ang/ps] for T, local source term, rho_e, Ce, kappa_e respectively.

## Notes and limitations

- The exact physical interpretation of beta(rho) changes with the precise model.
- If T_infile is not NULL then C_e, rho_e, kappa_e, T_e, NX, NY, NZ are ignored and are read from the filename supplied. If NULL is provided as the filename then the FDM grid is initialised with the parameters provided in the command.
- The implementation of the model is applicable to alloys, but this has not been tested thoroughly yet.


## Electron-ion coupling database

USER-EPH model requires for the user to supply electron-ion coupling parametrisations, analogous to empirical potentials, which will define the non-equilibrium dynamics of the system they are studying. As the creation of these files is rather involved (both computationally as well as work hours) we provide here an option to supply user supplied and peer reviewed parametrisations for open use by the general scientific community.

See Data/README.md for currently published parametrisation along with references.
If you want to add your parametrisation with correct references, send a request with an e-mail to [artur.tamm@ut.ee](mailto:artur.tamm@ut.ee)

## Tutorial

Examples can be found in Examples/ directory. To run them type lmp_serial -i run. lmp in the appropriate example directory and assuming executable is in PATH. Some of the examples may take long on older machines, so tweak the input file ( run. lmp ) accordingly. Every example contains a README file that describes what the runscript does.

## Example 1

Examples/Example_1/ : In this example a crystal structure is created and the model is applied with both the friction and random force terms. The electrons are kept at constant temperature $(300 \mathrm{~K})$. This example illustrates the thermalisation process from 0K to the target temperature through electron-ion interaction only.

```
$ cd Examples/Example_1
$ mypath/lmp_serial -i run.lmp
```

The run will write to the file out.data, column 2 has the time (in ps), columns 3 and 5 have the ionic and the electronic temperature respectively.

```
$ gnuplot
> plot "out.data" u 2:3 w lp lw 2 t "Tion", "out.data" u 2:5 w lp lw 2 t "Te"
```

You will see that the ionic temperature increases and approaches the (fixed) electronic temperature (300K).
![](https://cdn.mathpix.com/cropped/cafbb737-58f1-4167-b3f2-bde0945084ca-09.jpg?height=1237&width=1666&top_left_y=141&top_left_x=253)

## Example 2

Examples/Example_2/ : This example illustrates the use cooling of the ionic systems due to electrons only. This means that only the friction term acts on atoms and removes energy. This is equivalent to having electrons at 0K.
![](https://cdn.mathpix.com/cropped/cafbb737-58f1-4167-b3f2-bde0945084ca-10.jpg?height=1243&width=1696&top_left_y=139&top_left_x=206)

## Example 3

Examples/Example_3/ : In this example the full model with electronic heat equation FDM grid is used. The crystal is created at equilibrium positions ( 0 K ) and it is heated by electrons. During the simulation the electronic system will cool and the ionic system heat. At equilibrium both systems end up at the same temperature on average. Also, this example illustrates the automatic initialisation of the FDM grid with constant parameters. The electronic temperature at various grid points is written to files (one per step) ( T_out_XXXXXX ). Final state of the grid is stored and can be reused in later simulations ( T. restart ).

Although you can run in serial mode (like above), you can try to run this example with in parallel, for example in 4 processes. Make sure your MPI environment works, for example you may need \$ module load mpi/mpich-x86_64

```
$ mpirun -np 4 mypath/lmp_mpi -i run.lmp
$ gnuplot
> plot "out.data" u 2:3 w lp lw 2 t "Tion", "out.data" u 2:5 w lp lw 2 t "Te"
```

![](https://cdn.mathpix.com/cropped/cafbb737-58f1-4167-b3f2-bde0945084ca-11.jpg?height=1243&width=1670&top_left_y=137&top_left_x=251)

## Example 4

Examples/Example_4/ : This example reads the FDM grid parameters from a file ( T.in ). In this file a source term is added at line in the grid representing the energy dumped by swift ion. During the simulation the ionic system will heat while electron temperature will diffuse and due to gradient in the electronic system forces acting on atoms at different grid points will 'feel' different random forces in magnitude.

After a few MD-TTM steps the electronic temperature field will look like this:
![](https://cdn.mathpix.com/cropped/cafbb737-58f1-4167-b3f2-bde0945084ca-12.jpg?height=1256&width=1653&top_left_y=124&top_left_x=247)

## Example 5

```
Examples/Example_5/ :
```

This the same as Example 1, but with GPU-enabled acceleration.

```
$ cd Examples/Example_5
$ mpirun -n 2 mypath/lmp_mpi_gpu -i run.lmp
```

On a specialized cluster like LLNL/lassen you need a submission script

```
#!/bin/bash
## job.bsub
#BSUB -nnodes 2 # nodes
#BSUB -W 120 # walltime in min
#BSUB -G Bank # your bank
#BSUB -J Jobname # name of job
#BSUB -q pbatch # queue to use (or pdebug)
# Run info and srun job launch
jsrun -r4 -a1 -c1 -g1 -E OMP_NUM_THREADS=1 lmp_mpi_gpu -i run.lmp
```

\$ bsub < job.bsub

To run interactively:
\$ bsub -Is jsrun -r4 -a1 -c1 -g1 ~/mywork/lammps/src/lmp_mpi_gpu -i run.lmp
(the arguments are: -r :num_resources (cpus), -a :mpi_tasks_per_resource, -c :cpus_per_resources, g :gpus_per_resource)

Example 6

## Releases 1

release-used-for-W-UEDS Latest
on Mar 4, 2024

## Packages

No packages published

## Contributors 4

## artuuuro Artur Tamm

## correaa Alfredo Correa

monkishprawn Ilja Stanovõhh
alfC

## Languages

- $\mathbf{C}++90.0 \%$
Cuda 3.9\%
MATLAB 2.4\%
Shell 1.7\%
Makefile 1.4\%
Gnuplot 0.6\%
