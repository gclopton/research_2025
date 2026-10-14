// MathLive 0.110.0 recognizes oiint/oiiint but KaTeX Size fonts lack U+222F/2230.
// Render the existing multiple-integral glyph with an SVG contour using its
// real dimensions. The atom value/command and serialization remain unchanged.
export function patchMathlive(source){
 const replacement='(this.value === "∯" ? "∬" : this.value === "∰" ? "∭" : this.value)';
 const overlay=name=>`if(this.value === "∯" || this.value === "∰") {
  ${name}.setStyle("position","relative");
  const originalMarkup=${name}.toMarkup.bind(${name});
  ${name}.toMarkup=()=>{const html=originalMarkup();const end=html.lastIndexOf('</span>');return html.slice(0,end)+ '<span aria-hidden="true" style="position:absolute;left:0.08em;top:calc(50% + 0.025em);width:calc(100% + 0.32em);height:0.52em;transform:translateY(-50%);box-sizing:border-box;border:0.065em solid currentColor;border-radius:50%;pointer-events:none"></span>'+html.slice(end);};
 }`;

 if(source.includes('const base = new Box(this.value, {\n      fontFamily: large')){
  source=source.replace('const base = new Box(this.value, {\n      fontFamily: large',`const base = new Box(${replacement}, {\n      fontFamily: large`);
  const marker='    if (!base) return null;\n    base.right = base.italic;';
  if(!source.includes(marker))throw Error('MathLive browser render patch anchor changed');
  return source.replace(marker,`    if (!base) return null;\n    ${overlay('base')}\n    base.right = base.italic;`);
 }
 const marker='i=new y(this.value,{fontFamily:r?"Size2-Regular":"Size1-Regular",classes:"ML__op-symbol "';
 if(source.includes(marker))return source.replace(marker,`i=new y(${replacement},{fontFamily:r?"Size2-Regular":"Size1-Regular",classes:"ML__op-symbol "`).replace('if(!i)return null;i.right=i.italic;',`if(!i)return null;${overlay('i')}i.right=i.italic;`);
 throw Error('MathLive integral patch does not match the pinned version');
}
