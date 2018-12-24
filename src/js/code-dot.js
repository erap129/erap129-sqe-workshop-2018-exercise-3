function createGraphScript(graph){
    let graphScript = 'digraph {';
    graphScript = addAllNodes(graphScript, graph);
    graphScript = addAllEdges(graphScript, graph);
    graphScript += ' }';
    return graphScript;
}

function addAllNodes(graphScript, graph){
    for(let i=0; i<graph.length; i++){
        graphScript += 'node_' + i + ' [label="' + (i+1) + '\n' + graph[i].label + '"';
        let shape = 'box';
        if(graph[i].true || graph[i].false)
            shape = 'diamond';
        graphScript += ' shape=' + shape;
        if(graph[i].isColor)
            graphScript += ' style=filled fillcolor=green';
        graphScript += ']\n';
    }
    return graphScript;
}

function addAllEdges(graphScript, graph){
    for(let i=0; i<graph.length; i++){
        if(graph[i].normal){
            let node2Ind = graph.indexOf(graph[i].normal);
            graphScript = addEdge(i, node2Ind, graphScript);
        }
        if(graph[i].true){
            let node2Ind = graph.indexOf(graph[i].true);
            graphScript = addEdge(i, node2Ind, graphScript);
        }
        if(graph[i].false){
            let node2Ind = graph.indexOf(graph[i].false);
            graphScript = addEdge(i, node2Ind, graphScript);
        }
    }
    return graphScript;
}

function addEdge(ind_1, ind_2, graphScript){
    graphScript += 'node_' + ind_1 + ' -> ' + 'node_' + ind_2 + '\n';
    return graphScript;
}

export {createGraphScript};