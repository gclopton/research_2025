"""Generate a synthetic research-style conversion fixture, never edit research notes."""
from pathlib import Path
import hashlib, json, math
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path(__file__).resolve().parents[1]/'tests/fixtures/citation-article'
root.mkdir(parents=True,exist_ok=True)
assets=root/'assets';assets.mkdir(exist_ok=True)
plt.rcParams.update({'font.size':10,'axes.spines.top':False,'axes.spines.right':False,'savefig.dpi':160})
x=np.linspace(0,1,81);X,Y=np.meshgrid(x,x);u=np.sin(np.pi*X)*np.cos(np.pi*Y);v=-np.cos(np.pi*X)*np.sin(np.pi*Y)
w=2*np.pi*np.sin(np.pi*X)*np.sin(np.pi*Y)
fig,ax=plt.subplots(1,2,figsize=(9,3.7),layout='constrained')
ax[0].streamplot(x,x,u,v,density=.85,color='#286b93',linewidth=.8)
im=ax[1].pcolormesh(X,Y,w,cmap='viridis',shading='auto');fig.colorbar(im,ax=ax[1],label='Vorticity (dimensionless)')
for a,t in zip(ax,['(a) Analytic velocity field','(b) Analytic vorticity']):a.set(title=t,xlabel='x',ylabel='y',aspect='equal')
fig.savefig(assets/'flow-field.png');plt.close(fig)
rows=[]
for n in [16,32,64,128]:
 z=np.linspace(0,1,n+1); xx,yy=np.meshgrid(z,z);h=1/n
 uu=np.sin(np.pi*xx)*np.cos(np.pi*yy);vv=-np.cos(np.pi*xx)*np.sin(np.pi*yy)
 du_dy,du_dx=np.gradient(uu,h,edge_order=2);dv_dy,dv_dx=np.gradient(vv,h,edge_order=2)
 exact=2*np.pi*np.sin(np.pi*xx)*np.sin(np.pi*yy)
 e=np.sqrt(np.mean((dv_dx[1:-1,1:-1]-du_dy[1:-1,1:-1]-exact[1:-1,1:-1])**2));div=np.max(np.abs((du_dx+dv_dy)[1:-1,1:-1]))
 rows.append((n,e,div))
fig,ax=plt.subplots(figsize=(6.6,3.6),layout='constrained');ns=np.array([r[0] for r in rows]);es=np.array([r[1] for r in rows]);ax.loglog(ns,es,'o-',color='#286b93',label='Computed interior RMS error');ax.loglog(ns,es[0]*(ns[0]/ns)**2,'--',color='#bf6e27',label='Second-order guide');ax.set(xlabel='Intervals per direction, N',ylabel='RMS vorticity error',title='Grid refinement of the synthetic flow');ax.legend();ax.grid(alpha=.18);fig.savefig(assets/'convergence.png');plt.close(fig)
mdrows='\n'.join(f'| {n} | {e:.6f} | {d:.2e} |' for n,e,d in rows)
table='| Grid intervals | Vorticity RMS error | Maximum divergence |\n| ---: | ---: | ---: |\n'+mdrows
html='''<table>
<thead><tr><th rowspan="2">Diagnostic</th><th colspan="2">Interpretation</th></tr><tr><th>Analytic field</th><th>Numerical estimate</th></tr></thead>
<tbody><tr><th>Mass balance</th><td>Zero divergence</td><td>Roundoff residual</td></tr><tr><th>Rotation</th><td>Positive interior vorticity</td><td>Second-order convergence</td></tr></tbody>
</table>'''
article=r'''# A reproducible planar-flow benchmark for citation cleanup tests

**Synthetic methods article · October 2026**  
Research software test fixture; generated data, no external scientific claims.

## Abstract

Reliable interpretation of a numerical result depends on retaining the connection between a claim and its source. Here we use a smooth, two-dimensional velocity field to examine both a familiar differentiation calculation and the behavior of citations during document cleanup. The analytic field is divergence free throughout the square domain. A centered finite-difference estimate approaches the analytic vorticity as the grid is refined. The example supplies prose, equations, figures, captions, a Markdown table, a grouped HTML table, and repeated phrases. It is intended as a reproducible software fixture rather than a report of new physical measurements.

## 1. Introduction

PDF conversion often preserves the words of an article while disrupting their presentation. A sentence may be broken across lines, a caption may be separated from its figure, and a heading may arrive as ordinary bold text. These changes should not invalidate a quotation whose scientific content is unchanged. By contrast, changing a sign or a reported value can change the argument. Citation recovery must therefore distinguish layout repair from a revision to the underlying statement.

A smooth flow provides a compact example with several kinds of supporting material. The velocity field can be displayed as streamlines, its curl can be plotted as a scalar field, and discretization errors can be summarized numerically. Each representation has a different role. Streamlines describe the instantaneous direction of motion, whereas the error plot tests an approximation. The convergence result does not establish accuracy for every possible flow.

## 2. Model and numerical procedure

### 2.1 Analytic field

The domain is the unit square. Coordinates and velocities are dimensionless. We prescribe the components

$$
u(x,y)=\sin(\pi x)\cos(\pi y),\qquad
v(x,y)=-\cos(\pi x)\sin(\pi y).
$$

The divergence vanishes because the two derivatives cancel:

$$
\nabla\cdot\mathbf{v}=\frac{\partial u}{\partial x}+\frac{\partial v}{\partial y}
=\pi\cos(\pi x)\cos(\pi y)-\pi\cos(\pi x)\cos(\pi y)=0.
$$

The analytic vorticity is positive in the interior of the domain. It approaches zero on the boundary. This statement concerns the scalar out-of-plane component under the sign convention in the next equation; reversing that convention reverses the sign.

$$
\zeta=\frac{\partial v}{\partial x}-\frac{\partial u}{\partial y}
=2\pi\sin(\pi x)\sin(\pi y).
$$

![[Citation article assets/flow-field.png]]

**Figure 1. Analytic flow and vorticity.** Panel (a) shows the velocity directions. Panel (b) shows the scalar curl using the stated sign convention. Both panels refer to the same analytic field. The plotted arrows do not track material particles through time.

### 2.2 Discrete derivatives

Uniform grids use 16, 32, 64, and 128 intervals in each direction. Centered differences are evaluated in the interior. Although boundary derivatives are computed by the plotting script, they are excluded from the reported interior error norm. The boundary points are excluded from the reported error norm.

$$
\left.\frac{\partial v}{\partial x}\right|_{i,j}
\approx\frac{v_{i+1,j}-v_{i-1,j}}{2h},\qquad h=N^{-1}.
$$

For a smooth field, the leading truncation error of this centered derivative is proportional to the square of the spacing. Grid refinement is therefore expected to reduce the vorticity error at approximately second order. The divergence residual in this special separable field is close to roundoff because the corresponding discrete terms cancel. This cancellation is a property of the example and is not a general guarantee for arbitrary measurements.

## 3. Results

### 3.1 Grid refinement

The vorticity error decreases under grid refinement. The tabulated values were generated by the accompanying script, not copied from a published paper. Each value refers to the same interior norm and the same analytic reference. Altering that norm or including the boundary would produce a different comparison. Table 1 reports the complete refinement sequence.

**Table 1. Interior derivative checks.** The divergence column reports the largest absolute interior residual. The vorticity column reports an unweighted RMS error over interior grid points.

TABLE_ONE

![[Citation article assets/convergence.png]]

**Figure 2. Refinement behavior.** Symbols show the computed vorticity errors. The dashed guide has a slope of minus two when error is plotted against the number of intervals. The guide is anchored to the coarsest-grid result. The error curve and reference guide use the same axes.

### 3.2 Distinct interpretations

The two diagnostics answer different questions. A small divergence residual checks one constraint on the field, while agreement of the curl with an analytic expression checks a different combination of derivatives. Neither quantity alone supplies a complete description of local deformation. Table 2 keeps the diagnostic and its interpretation together, including a grouped header that may be reconstructed during Markdown cleanup.

**Table 2. Diagnostic interpretation.** This table intentionally contains merged header cells to exercise source rendering.

TABLE_TWO

## 4. Discussion

The results support the expected refinement behavior for this deliberately smooth field. They do not address discontinuities, noisy experiments, uncertain boundary conditions, or irregular grids. A visually attractive streamline plot also does not establish convergence. The image, the table, and the accompanying prose must retain their separate meanings when the source is reorganized.

The method is stable.

The previous short sentence is deliberately repeated in the limitations section. A citation that selects only this sentence requires surrounding context; its words alone are insufficient to identify the intended occurrence. This duplication is useful for testing ambiguity without inventing an OCR error. An implementation should not attach to the first occurrence merely because it appears earlier in the note.

### 4.1 Formatting and annotation

The efficient workflow preserves the original quotation. Added emphasis changes appearance without changing the underlying sentence. A reader comment belongs to the annotation record, while an inserted source comment may introduce additional surrounding text. Neither operation should overwrite the saved quotation. The “reference configuration” label is retained as written. A soft hyphen in the converted word effect is a typesetting artifact in this fixture.

## 5. Limitations

The method is stable.

This second occurrence belongs to a different paragraph and cannot be selected safely by the short quotation alone. The benchmark contains smooth analytic data and is not evidence that a general OCR system will preserve scientific notation. A conversion can misread a minus sign, drop a subscript, or join unrelated columns. Such repairs require checking the original source. The material is not assumed to be isotropic. Removing the word not from this last sentence changes the assumption and must not be treated as formatting.

## 6. Conclusions

The benchmark connects a known analytic field to generated figures and quantitative derivative checks. Its citation fixtures deliberately separate recoverable formatting changes from altered scientific statements. Figures remain the same files when their positions change. Tables require their values and cell structure to remain intact. A citation should remain attached after harmless reflow, but an ambiguous or materially changed target must remain visible for review.

## References

[1] Internal analytic definition in Section 2 of this synthetic fixture.

[2] The accompanying generation script and numerical data in Table 1. No external article is being cited or reproduced.
'''.replace('TABLE_ONE',table).replace('TABLE_TWO',html)
# Preserve semantics while emulating mild conversion artifacts.
converted=article.replace('## 1. Introduction','**1. Introduction**').replace('## 3. Results','**3. Results**')
converted=converted.replace('The analytic field is divergence free throughout the square domain.','The analytic field is divergence\nfree throughout the square domain.')
converted=converted.replace('The efficient workflow preserves the original quotation.','The efﬁcient workﬂow preserves the original\nquotation.')
converted=converted.replace('The boundary points are excluded from the reported error norm.','The boundary points are excluded from the\n\nreported error norm.')
converted=converted.replace('The “reference configuration” label is retained as written.','The "reference configuration" label is retained as written.')
converted=converted.replace('word effect','word ef\u00adfect')
converted=converted.replace('## 4. Discussion','---\n\nSYNTHETIC METHODS · PAGE 4\n\n## 4. Discussion')
# Cleanup includes formatting changes within a table, and a new preceding table shifts ordinals.
clean=article.replace('The efficient workflow','The **efficient workflow**').replace('| 16 |','|   16   |')
clean=clean.replace('## 3. Results','## 3. Results\n\n| Metadata | Value |\n| --- | --- |\n| Source | Synthetic fixture |')
# Move the convergence figure intact from Results to Discussion.
image='![[Citation article assets/convergence.png]]'
clean=clean.replace(image+'\n\n','').replace('## 4. Discussion','## 4. Discussion\n\n'+image)
for name,text in [('converted.md',converted),('cleaned.md',clean)]: (root/name).write_text(text)
quotes=[
'The analytic field is divergence free throughout the square domain.',
'The convergence result does not establish accuracy for every possible flow.',
'The analytic vorticity is positive in the interior of the domain.',
'Both panels refer to the same analytic field.',
'The plotted arrows do not track material particles through time.',
'The boundary points are excluded from the reported error norm.',
'The vorticity error decreases under grid refinement.',
'The error curve and reference guide use the same axes.',
'Neither quantity alone supplies a complete description of local deformation.',
'The efficient workflow preserves the original quotation.',
'The "reference configuration" label is retained as written.',
'A soft hyphen in the converted word effect is a typesetting artifact in this fixture.',
'The material is not assumed to be isotropic.',
'Figures remain the same files when their positions change.',
'The method is stable.'
]
selections=[{'quote':q,'comment':f'Article prose check {i+1}','color':'#247441','opacity':.15} for i,q in enumerate(quotes)]
selections += [dict(image='Citation article assets/flow-field.png',rect=[.04,.08,.40,.84],sha256=hashlib.sha256((assets/'flow-field.png').read_bytes()).hexdigest(),comment='Flow field panel region'),dict(image='Citation article assets/convergence.png',whole=True,sha256=hashlib.sha256((assets/'convergence.png').read_bytes()).hexdigest(),comment='Convergence figure moved intact')]
selections += [dict(table=1,cells=[[2,2]],sha256=hashlib.sha256(table.encode()).hexdigest(),comment='Coarsest-grid error cell'),dict(table=2,whole=True,sha256=hashlib.sha256(html.encode()).hexdigest(),comment='Grouped diagnostic table')]
record={'version':1,'claims':{'article':{'label':'Full article cleanup simulation','papers':[{'citekey':'syntheticFlow2026','label':'Synthetic planar-flow article','path':'Citation article simulation.md','selections':selections}]}}}
fingerprint_rows=[[[t,1,1,True] for t in ['Grid intervals','Vorticity RMS error','Maximum divergence']]]+[[[str(n),1,1,False],[f'{e:.6f}',1,1,False],[f'{d:.2e}',1,1,False]] for n,e,d in rows]
selections[17]['tableFingerprint']=hashlib.sha256(json.dumps(fingerprint_rows,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
(root/'records.json').write_text(json.dumps(record,indent=2)+'\n')
(root/'data.json').write_text(json.dumps(rows,indent=2)+'\n')
print(root)
print('Article words:',len(article.split()),'selections:',len(selections))
