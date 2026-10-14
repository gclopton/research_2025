import {Menu,MenuItem} from 'obsidian';
/** Cooperative submenus live only for this Menu, shared by the studio plugins. */
export function menuGroup(menu:Menu,key:string,title:string,icon:string,section=key==='insert'?'insert':key==='annotation-visibility'?'view':key.startsWith('mark-')?'selection':'action'):Menu{
 menu.setUseNativeMenu(false);
 const symbol=Symbol.for('research-studio.menu.'+key),host=menu as any;
 if(host[symbol])return host[symbol];
 let child:Menu;
 menu.addItem(item=>{item.setTitle(title).setIcon(icon).setSection(section);
  const native=item as MenuItem&{setSubmenu?:()=>Menu};
  if(typeof native.setSubmenu==='function')child=native.setSubmenu();
  else {child=new Menu();item.onClick(event=>{const target=event.target as HTMLElement|null,box=target?.getBoundingClientRect();child.showAtPosition({x:box?.right??100,y:box?.top??100});});}
 });host[symbol]=child!;return child!;
}
