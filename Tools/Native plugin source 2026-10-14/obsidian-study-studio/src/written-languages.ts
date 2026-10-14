import {python} from '@codemirror/lang-python';
import {cpp} from '@codemirror/lang-cpp';
import {Language,StreamLanguage} from '@codemirror/language';
import {shell} from '@codemirror/legacy-modes/mode/shell';
import {mathematica} from '@codemirror/legacy-modes/mode/mathematica';
 const languages:Record<string,Language>={python:python().language,py:python().language,cpp:cpp().language,'c++':cpp().language,c:cpp().language,bash:StreamLanguage.define(shell),sh:StreamLanguage.define(shell),shell:StreamLanguage.define(shell),mathematica:StreamLanguage.define(mathematica),wolfram:StreamLanguage.define(mathematica),wl:StreamLanguage.define(mathematica)};
export const writtenLanguage=(info:string):Language|null=>languages[info.toLowerCase()]??null;
