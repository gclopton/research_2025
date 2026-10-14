export type EquationAlignment = 'left' | 'center' | 'right' | 'equals';

// Only split at the outer equation level: matrix cells, groups and escaped
// characters belong to their original expression.
function splitOuter(source: string, delimiter: string): string[] {
 const parts: string[] = []; let start=0, braces=0, environments=0;
 for(let i=0;i<source.length;i++) {
  if(source[i]==='\\') {
   const environment=source.slice(i).match(/^\\(begin|end)\{[^}]+\}/);
   if(environment){environments+=environment[1]==='begin'?1:-1;if(environments<0)throw new Error('This compound layout must be edited in Native LaTeX.');i+=environment[0].length-1;continue;}
   if(!braces&&!environments&&source.startsWith(delimiter,i)) {parts.push(source.slice(start,i));i+=delimiter.length-1;start=i+1;continue;}
   const command=source.slice(i).match(/^\\(?:[a-zA-Z]+|.)/s);if(command)i+=command[0].length-1;
   continue;
  }
  if(source[i]==='{')braces++;
  else if(source[i]==='}'){braces--;if(braces<0)throw new Error('This compound layout must be edited in Native LaTeX.');}
  else if(!braces&&!environments&&source.startsWith(delimiter,i)){parts.push(source.slice(start,i));i+=delimiter.length-1;start=i+1;}
 }
 if(braces||environments)throw new Error('This compound layout must be edited in Native LaTeX.');
 parts.push(source.slice(start));return parts;
}
export function alignEquation(source:string, alignment:EquationAlignment):string {
 let body=source.trim();
 const environment=body.match(/^\\begin\{(aligned|gathered|array)\}(?:\{([lcr])\})?([\s\S]*)\\end\{\1\}$/);
 if(environment && (environment[1]!=='array'||environment[2])) body=environment[3];
 else if(body.startsWith('\\displaylines{')&&body.endsWith('}'))body=body.slice(14,-1);
 const rows=splitOuter(body,'\\\\').map(row=>{
  // Changing alignment must not silently discard explicit vertical spacing.
  if(/^\s*\[/.test(row))throw new Error('This layout has custom row spacing. Keep it in Native LaTeX.');
  const cells=splitOuter(row,'&');
  if(cells.length>2)throw new Error('This layout has multiple alignment pairs. Keep it in Native LaTeX.');
  const joined=cells.join('').trim().replace(/^\\displaystyle\s*/, '');
  if(alignment!=='equals')return joined||'{}';
  const terms=splitOuter(joined,'=');
  if(terms.length===1&&cells.length===2)return cells.map(x=>x.trim()).join(' & ');
  return terms.length>1?`${terms.shift()} &= ${terms.join('=')}`:`{} & ${joined||'{}'}`;
 });
 if(alignment==='equals')return `\\begin{aligned}${rows.join('\\\\ ')}\\end{aligned}`;
 if(alignment==='center')return `\\begin{gathered}${rows.join('\\\\ ')}\\end{gathered}`;
 return `\\begin{array}{${alignment==='left'?'l':'r'}}${rows.map(x=>'\\displaystyle '+x).join('\\\\ ')}\\end{array}`;
}
