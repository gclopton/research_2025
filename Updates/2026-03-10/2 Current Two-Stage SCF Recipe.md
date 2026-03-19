
## Stage 1 – Rough (Davidson, Cold Start)

- ALGO = Normal (Davidson diagonalizer), DFT+U active from step 1
- Builds charge density form scratch using MAGMOM (initialized from differentiated MAGMOM seed) as only guide
- Davidson updates the charge density conservatively, giving the +U potential time to localize f-electrons before the solution is committed
- Slower per step, but seems to be performing better than previous methods; does not get locked into wrong electronic state early on (as easily as the other methods)

## Stage 2 – Rough (Davidson, Cold Start)
- ALGO = ALL (RMM-DIIS), reads WAVECAR + CHGCAR from rough stage
- Fast but aggressive - refines within whatever basin Stage 1 found
- Converges tightly to final energy


**Result for $Ce_{7}O_{12}$:** Stage 1 fails to converge with 10-25 eV energy oscillations, NELM exhaustion. 
	_conclusion:_ Davidson alone cannot navigate charge-ordering landscape of $Ce7O12$ mixed-valence system from a cold start












