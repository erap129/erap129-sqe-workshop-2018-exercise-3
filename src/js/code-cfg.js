import * as esgraph from 'esgraph';
import * as escodegen from 'escodegen';

function makeGraph(code){
    let funcArr = undefined;
    for(let n in code.body)
        if(code.body[n].type == 'FunctionDeclaration')
            funcArr = code.body[n];
    let func = funcArr.body;
    let gr = esgraph(func)[2];
    for(let n in gr)
        delete gr[n].exception;
    cleanEntryExit(gr);
    for(let n in gr)
        gr[n].label = escodegen.generate(gr[n].astNode);
    fixNormal(gr);
    return gr;
}

function cleanEntryExit(gr){
    let entryNode = gr[0];
    let realEntry = entryNode.normal;
    realEntry.prev.splice(0, realEntry.prev.length);
    gr.splice(0, 1);
    let exit = gr[gr.length - 1];
    let realExit = undefined;
    for(let n in exit.prev)
        if(exit.prev[n].astNode.type == 'ReturnStatement')
            realExit = exit.prev[n];
    realExit.type = 'exit';
    realExit.next.splice(0, realExit.next.length);
    delete realExit.normal;
    gr.splice(gr.length-1,1);
    for(let n in gr)
        if(gr[n].next.indexOf(exit) >= 0){
            let nextNodes = gr[n].next;
            nextNodes.splice(nextNodes.indexOf(exit), 1);
        }
}

function fixNormal(gr){
    for(let i=0; i<gr.length; i++){
        if(gr[i].normal && gr[i].normal.normal){
            let normNode = gr[i].normal;
            let reg = gr[i];
            reg.label = reg.label + '\n' + reg.normal.label;
            reg.next = normNode.next;
            reg.normal = reg.normal.normal;
            let removeNode = gr.indexOf(normNode);
            gr.splice(removeNode, 1);
            i--;
        }
    }
}

export {makeGraph};