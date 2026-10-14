import {MarkdownRenderChild,Plugin} from 'obsidian';
/** Rendered sections can outlive a plugin reload. Release their listeners too. */
export function readingChildren(plugin:Plugin){
 const children=new Set<MarkdownRenderChild>();
 plugin.register(()=>{for(const child of [...children])child.unload();children.clear();});
 return <T extends MarkdownRenderChild>(child:T):T=>{children.add(child);child.register(()=>children.delete(child));return child;};
}
