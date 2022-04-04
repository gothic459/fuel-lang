import { ErrorNode } from "antlr4ts/tree/ErrorNode";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { ObjectChildReferenceContext } from "./FireParser";
import { CompilationUnitContext, StmtContext, RelationStmtContext, AssignStmtContext, PrintStmtContext, JsonContext, JsonObjectContext, VariableNameContext, KeyValuePairContext, PrimitiveEntityContext, ValueContext, ArrContext, BoolContext, IfThenDoStmtContext } from "./FireParser";
import { FireVisitor } from "./FireVisitor";

export default class Visitor implements FireVisitor<any> {
    visitCompilationUnit?: (ctx: CompilationUnitContext) => any;
    visitStmt?: (ctx: StmtContext) => any;
    // visitRelationStmt?: (ctx: RelationStmtContext) => any;
    // visitAssignStmt?: (ctx: AssignStmtContext) => any;
    // visitPrintStmt?: (ctx: PrintStmtContext) => any;
    visitJson?: (ctx: JsonContext) => any;
    visitJsonObject?: (ctx: JsonObjectContext) => any;
    visitVariableName?: (ctx: VariableNameContext) => any;
    visitKeyValuePair?: (ctx: KeyValuePairContext) => any;
    // visitPrimitiveEntity?: (ctx: PrimitiveEntityContext) => any;
    visitValue?: (ctx: ValueContext) => any;
    visitArr?: (ctx: ArrContext) => any;
    visitBool?: (ctx: BoolContext) => any;
    visitObjectChildReference?: (ctx: ObjectChildReferenceContext) => any;
    visit(tree: ParseTree) {
        return tree.accept(this);
    }
    visitTerminal(node: TerminalNode) {
        throw new Error("Method not implemented.");
    }
    visitErrorNode(node: ErrorNode) {
        throw new Error("Method not implemented.");
    }
    objects = {};
    relations = {};
    arrays = {};

    printables = [];
    defineErrors = [];
    alertInvocations = [];

    private checkIfValueIsDefined(subjectName: ParseTree) {
        if (this.objects[subjectName?.text] || this.arrays[subjectName?.text] || this.relations[subjectName?.text]) {
            return true;
        }
        return false;
    }
    private getLineNumber(ctx?: ParseTree) {
        return ctx?.start?.line;
    }

    visitAssignStmt(ctx: AssignStmtContext) {
        let prefix = ctx?.children[0];
        let objName = ctx?.children[1];
        let objValues = ctx?.children[3];
        console.log("trying to assign with", prefix, objValues.constructor.name);

        if (!prefix || !objName || !objValues) {
            console.log("error: ", prefix, objName, objValues);
            return;
        }

        if (prefix.constructor.name === 'PrimitiveEntityContext') {
            let obj = {
                name: objName.text,
                type: prefix.text,
                values: JSON.parse(objValues.text)
            }
            this.objects[objName.text] = obj;
        }

        if (objValues.constructor.name === 'ArrContext') {
            console.log("found array");
            let arrValues = objValues.text.slice(1, -1).split(',');
            console.log(`${objName.text} = ${arrValues}`);

            let arr = {
                name: objName.text,
                type: "array",
                values: arrValues.map(value => {
                    console.log("trying to map: ", value);
                    if (this.objects[value]) {
                        console.log("found object: ", this.objects[value]);
                        return this.objects[value].values;
                    }
                    if (this.arrays[value]) {
                        console.log("found array: ", this.arrays[value]);
                        return this.arrays[value].values;
                    }
                    if (this.relations[value]) {
                        console.log("found relation: ", this.relations[value]);
                        return this.relations[value].values;
                    }
                    if (value.includes('"')) {
                        console.log("found string: ", value);
                        return value.slice(1, -1);
                    }
                    if (value.includes("")) {
                        return value;
                    }
                    console.log("found primitive: ", value);
                    return value;
                })
            }
            this.arrays[objName.text] = arr;
        }

    }
    visitIfThenDoStmt(ctx: IfThenDoStmtContext) {
        let ifIndex = ctx.children.findIndex(child => child.text === 'IF');
        let doIndex = ctx.children.findIndex(child => child.text === 'DO');

        let ifSubject = ctx.children[ifIndex + 1];
        let ifFieldReference = ctx.children[ifIndex + 2].text.substring(1);
        //==========================================================
        let operatorNumberPair = ctx.children[3];
        let operator = operatorNumberPair.children[0].text;
        let number = operatorNumberPair.children[1].text;

        //==========================================================
        let doSubject = ctx.children[doIndex + 1];
        // let doFieldReference = ctx.children[doIndex + 2].text.substring(1);

        let subjects = [ifSubject, doSubject];


        subjects?.forEach(subject => {
            if (subject) {
                let line = this?.getLineNumber(subject);
                if (!this.checkIfValueIsDefined(subject)) {
                    this.defineErrors.push(`at line ${line} "${subject.text}" is not defined`);
                    return;
                }
            }
            // return;
        });

        let ifSubjectObject = this?.objects[ifSubject?.text];
        let doSubjectObject = this?.objects[doSubject?.text];

        if (eval(ifSubjectObject?.values[ifFieldReference] + operator + number)) {
            let desc: string;
            for (const relation of Object.entries(this.relations)) {
                if (ifSubjectObject.values.entity === relation[1].entity1) {
                    desc = relation[1].values.name
                }
            }
            let invocation = {
                invoker: ifSubjectObject.values.entity,
                activity: ifSubjectObject.name,
                event: doSubjectObject.values.name,
                eventGoal: doSubjectObject.values.goal,
                eventLocation: doSubjectObject.values.location,
                invokerDesc: desc,
            }
            this.alertInvocations.push(invocation);
        }

    }
    visitRelationStmt(ctx: RelationStmtContext) {
        let prefix = ctx?.children[0];
        let relationENT1 = ctx?.children[1];
        // let relationType = ctx?.children[2];
        let relationENT2 = ctx?.children[3];
        let relationName = ctx?.children[5];
        let relationValue = ctx?.children[7];

        let variables = [relationENT1, relationENT2];
        variables.forEach(variable => {
            if (variable) {
                let line = this?.getLineNumber(variable);
                if (!this.checkIfValueIsDefined(variable)) {
                    this.defineErrors.push(`at line ${line} "${variable.text}" is not defined`);
                    return;
                }
            }
        });

        let relation = {
            name: relationName?.text,
            type: prefix?.text,
            entity1: relationENT1?.text,
            entity2: relationENT2?.text,
            values: JSON.parse(relationValue?.text)
        }
        this.relations[relationName.text] = relation;
    }
    visitPrintStmt(ctx: PrintStmtContext) {
        let printValue = ctx?.children[1];
        console.log("printing: ", printValue?.text);

        if (!this.checkIfValueIsDefined(printValue)) {
            console.log("print value is not defined");
            if (printValue) {
                console.log(`checking if val is string: ${printValue.text}`);
                if (printValue.text[0] === '"') {
                    console.log("print value is string");
                    this.setPrintables({
                        type: "string",
                        value: printValue.text.slice(1, -1)
                    });
                } else {
                    this.defineErrors.push(`at line ${this?.getLineNumber(printValue)} "${printValue.text}" is not defined`);
                    return;
                }

            }
            return
        }

        if (this.objects[printValue.text]) {
            console.log("printing object: ", this.objects[printValue.text]);
            this.setPrintables(this.objects[printValue.text]);
        }
        if (this.relations[printValue.text]) {
            console.log("printing relation: ", this.relations[printValue.text]);
            this.setPrintables(this.relations[printValue.text]);
        }
        if (this.arrays[printValue.text]) {
            console.log("printing array: ", this.arrays[printValue.text]);
            this.setPrintables(this.arrays[printValue.text]);
        }

    }
    visitPrimitiveEntity(ctx: PrimitiveEntityContext) {
        console.log("visiting primitive")
        console.log(ctx)
    }



    visitChildren(ctx) {
        if (!ctx) {
            return;
        }
        if (ctx.children) {
            return ctx.children.map(child => {
                if (child.children && child.children.length !== 0) {
                    return child.accept(this);
                } else {
                    return child.text;
                }
            });
        }

    }

    getObjects() {
        return this.objects;
    }
    getRelations() {
        return this.relations;
    }
    getArrays() {
        return this.arrays;
    }
    getAlertInvocations() {
        return this.alertInvocations;
    }
    getPrintables() {
        return this.printables;
    }
    getDefineErrors() {
        return this.defineErrors;
    }
    setPrintables(printable) {
        this.printables.push(printable);
    }

}