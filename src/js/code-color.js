import * as escodegen from 'escodegen';

var green_lines = [];
var red_lines = [];
var global_input_vector = {};

function resetColorParams(){
    green_lines = [];
    red_lines = [];
    global_input_vector = [];
}

function parseBody(ast, rows){
    if(ast.body.constructor === Array){
        for(var row in ast.body)
            color(ast.body[row]);
        if(ast.type == 'Program')
            return rows;
    }
    else
        color(ast.body);
}

function parseReturnStatement(ast, father){
}

function parseIfStatement(ast){
    let replacedExpr = escodegen.generate(ast.test);
    Object.keys(global_input_vector).forEach(function (key) {
        replacedExpr = replacedExpr.replace(key, global_input_vector[key]);
    });
    console.log(replacedExpr);
    if(eval(replacedExpr))
        green_lines.push(ast.loc.start.line);
    else
        red_lines.push(ast.loc.start.line);
    color(ast.consequent);
    color(ast.alternate);
}

var parseFunctions = {
    'IfStatement': parseIfStatement,
    'ReturnStatement': parseReturnStatement,
};

function color(ast, input_vector){
    input_vector = {x: 1, y: 2, z: 3};
    global_input_vector = input_vector;
    if(ast == null)
        return;
    if(parseFunctions.hasOwnProperty(ast.type))
        parseFunctions[ast.type](ast);
    if(ast.hasOwnProperty('body')){
        let res = parseBody(ast);
        if(ast.type == 'Program')
            return [green_lines, red_lines];
    }
}

export {color};
export {resetColorParams};
