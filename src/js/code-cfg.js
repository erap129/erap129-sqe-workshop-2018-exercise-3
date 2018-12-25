import * as escodegen from 'escodegen';
import * as esgraph from 'esgraph';

function makeGraph(code){
    let funcArr = undefined;
    for(let n in code.body)
        if(code.body[n].type == 'FunctionDeclaration')
            funcArr = code.body[n];
    let func = funcArr.body;
    let graph = esgraph(func)[2];
    for(let n in graph)
        delete graph[n].exception;
    cleanEntryExit(graph);
    for(let n in graph)
        graph[n].label = escodegen.generate(graph[n].astNode);
    fixNormal(graph);
    return graph;
}

function cleanEntryExit(graph){
    let entryNode = graph[0];
    let realEntry = entryNode.normal;
    realEntry.type = 'entry';
    realEntry.prev = [];
    graph.splice(0, 1);
    let exit = graph[graph.length - 1];
    let realExit = undefined;
    for(let n in exit.prev)
        if(exit.prev[n].astNode.type == 'ReturnStatement')
            realExit = exit.prev[n];
    realExit.next = [];
    realExit.type = 'exit';
    delete realExit.normal;
    graph.splice(graph.length - 1, 1);
    for(let n in graph)
        if(graph[n].next.indexOf(exit) != -1)
            graph[n].next.splice(graph[n].next.indexOf(exit), 1);
}

function fixNormal(graph){
    for(let i=0; i<graph.length; i++){
        if(graph[i].normal && graph[i].normal.normal){
            let norm = graph[i].normal;
            graph[i].label += '\n' + graph[i].normal.label;
            graph[i].normal = graph[i].normal.normal;
            graph[i].next = norm.next;
            let toRemove = graph.indexOf(norm);
            i = i - 1;
            graph.splice(toRemove, 1);
        }
    }
}

export {makeGraph};