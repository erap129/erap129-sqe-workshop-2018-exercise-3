import * as escodegen from 'escodegen';
import * as esgraph from 'esgraph';

function makeGraph(code){
    let func = code.body.filter(exp => exp.type == 'FunctionDeclaration')[0].body;
    let graph = esgraph(func)[2];
    for(let n in graph)
        delete graph[n].exception;
    graph = cleanEntryExit(graph);
    for(let n in graph)
        graph[n].label = escodegen.generate(graph[n].astNode);
    console.log(graph);
    fixNormal(graph);
    console.log(graph);
    return graph;
}

function cleanEntryExit(graph){
    let exit = graph[graph.length - 1];
    let ret = exit.prev.filter(n => n.astNode.type == 'ReturnStatement')[0];
    ret.type = 'exit';
    ret.next = [];
    graph[0].normal.prev = [];
    graph[0].normal.type = 'entry';
    delete ret.normal;
    return graph.slice(1, graph.length-1);
}

function fixNormal(graph){
    for(let i = 0; i < graph.length; i++){
        if(graph[i].normal && graph[i].normal.normal){
            let nextNorm = graph[i].normal;
            graph[i].next = nextNorm.next;
            graph[i].normal = nextNorm.normal;
            graph[i].label += '\n' + nextNorm.label;
            graph.splice(graph.indexOf(nextNorm), 1);
            i--;
        }
    }
}

export {makeGraph};