if exists('b:current_syntax')
  finish
endif
syntax match CodeLinksOutputNumber /[-+]\?\<\d\+\(\.\d*\)\?\([Ee][-+]\?\d\+\)\?/
syntax keyword CodeLinksOutputKeyword Iteration energy delta TOTAL POSITION FORCE
highlight default link CodeLinksOutputNumber Number
highlight default link CodeLinksOutputKeyword Keyword
let b:current_syntax = 'code_links_output'
