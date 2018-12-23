function createGraphScript(graph){
    console.log(graph);
    let graphScript = 'digraph {';
    graphScript = addAllNodes(graphScript, graph);
    graphScript = addAllEdges(graphScript, graph);
    graphScript += ' }';
    return graphScript;
}

function addAllNodes(graphScript, graph){
    for(const [i, n] of graph.entries()){
        let nodeLabel = (i+1) + '\n' + n.label;
        graphScript += 'node_' + i + ' [label="' + nodeLabel + '"';
        if(n.isColor)
            graphScript += ' style=filled fillcolor=green;'
        graphScript += ' shape=box]\n';
    }
    return graphScript;
}

function addAllEdges(graphScript, graph){
    for(const [i, n] of graph.entries()){
        graphScript = addEdgesForNode(n, i, graph, graphScript);
        console.log(graphScript);
    }
    return graphScript;
}

function addEdgesForNode(n, i, graph, graphScript){
    for(let edgeType of ['normal', 'true', 'false']){
        if(!n[edgeType])
            continue;
        graphScript += 'node_' + i + '->' + 'node_' + graph.indexOf(n[edgeType]);
        graphScript += '\n';
    }
    return graphScript;
}

export {createGraphScript};