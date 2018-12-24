import * as escodegen from 'escodegen';
import * as esgraph from 'esgraph';

function makeGraph(code){
    let funcArr = code.body.filter(exp => exp.type == 'FunctionDeclaration');
    let func = funcArr[0].body;
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
    let exitNode = graph[graph.length - 1];
    let realExit = exitNode.prev.filter(node => node.astNode.type == "ReturnStatement")[0];
    realExit.next = [];
    realExit.type = 'exit';
    delete realExit.normal;
    graph.splice(graph.length - 1, 1);
    for(let n in graph)
        if(graph[n].next.indexOf(exitNode) != -1)
            graph[n].next.splice(graph[n].next.indexOf(exitNode), 1);
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