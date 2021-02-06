async function get (param) {
    const {
        results,
        severidade,
        titulo,
        status,
        responsavel,
        dtexecantes,
        dtexecdepois
    } = param

    if (results === "all") { var limit = 0 }
    else { var limit = Number(results) || 20 }

    if ( severidade || titulo || status || responsavel || dtexecantes || dtexecdepois != null ) {
        var queryArray = new Array();
        if (severidade != null) { queryArray.push({severidade: severidade.toUpperCase()}) }
        if (titulo != null) { queryArray.push({titulo: {$regex: ".*" + titulo + ".*"}}) }
        if (status != null) { queryArray.push({status: {$regex: ".*" + status + ".*"}}) }
        if (responsavel != null) { queryArray.push({responsavel: {$regex: ".*" + responsavel.toLowerCase() + ".*"}}) }
        if (dtexecantes != null) { queryArray.push({dtExecucao: {$lte: dtexecantes}}) }
        if (dtexecdepois != null) { queryArray.push({dtExecucao: {$gte: dtexecdepois}}) }
        var query = { "$and" : queryArray };
    }
    else { var query = null }

    try {
        const result = await global.conn
            .collection("changes")
            .find(query)
            .project({severidade:1, titulo:1, status:1, dtExecucao:1, responsavel:1})
            .sort({dtExecucao:1})
            .limit(limit)
            .toArray();
        if (result.length != 0) { return { status: 200, message: result } }
        else { return {status: 204, message: "Não há mudanças para serem exibidas"} }
    } catch(error) { return {status: 500, message: "Erro de conexão com o banco de dados"} }
}

async function getOne (stringId) {
    try {
        var ObjectId = require('mongodb').ObjectID;
        var id = new ObjectId(stringId);
    }
    catch { return {status: 400, message: `Formato de id invalido (${stringId})`} }

    try {
        const result = await global.conn
            .collection("changes")
            .findOne({"_id" : id});
        if (result != null) { return { status: 200, message: result } }
        else { return {status: 404, message: `Mudança ${stringId} não encontrada`} }
    }
    catch(error) { return {status: 500, message: "Erro de conexão com o banco de dados" } }
}

async function post (body) {
    try {
        var change = {
            titulo: body.titulo,
            dtExecucao: body.dtExecucao,
            responsavel: body.responsavel,
            impactoRisco: body.impactoRisco,
            dtCriacao: new Date(),
            comite: body.comite,
            rotineira: body.rotineira
        }
    } catch(error) { return {status: 400, message: "Dados inválidos"} }

    if (body.aprovadores) {
        change.aprovadores = new Array();
        body.aprovadores.forEach((aprovador) => {
            change.aprovadores.push( {usuario: aprovador.toLowerCase(), status: "emAnalise"} )
        });
        change.severidade = "B";
        change.status = "emAnalise";
    } else {
        change.severidade = "C";
        change.status = "aprovada";
    }

    if (body.comite == true) {
        change.severidade = "A";
        change.status = "emAnalise";
    }

    if ( 1 === 0) { change.naoProgramada = true }; // Implantar lógica de naoProgramada baseada em data

    try {
        const result = await global.conn
            .collection("changes")
            .insertOne(change);
        if (result.insertedCount == 1) {
            return {status: 201, message: result.insertedId};
        }
    }
    catch(error) {
        if (error.name == "MongoError" && error.code == 121) {
            return {status: 400, message: "Dados inválidos ou incompletos"};
        }
        else {
            console.error(error);
            return {status: 500, message: "Erro de comunicação com o banco de dados"};
        }
    }
}

async function put (stringId, body) {
    // Convert o id para o formato correto
    try {
        var ObjectId = require('mongodb').ObjectID;
        var id = new ObjectId(stringId);
    }
    catch { return {status: 400, message: "Formato de id invalido"} }
    
    try {
        const result = await global.conn
            .collection("changes")
            .updateOne({"_id" : id}, {$set: body});
        if (result.modifiedCount === 1) {

            const result2 = await global.conn
                .collection("changes")
                .findOne({"_id" : id});
            if (result2) {
                const { aprovadores, comite } = result2
                if (aprovadores) {
                    newSev = "B";
                    newStatus = "emAnalise";
                    newAprovadores = new Array();
                    aprovadores.forEach((aprovador) => {
                        newAprovadores.push({usuario: aprovador.usuario, status: "emAnalise"});
                    });
                }
                else {
                    newSev = "C";
                    newStatus = "aprovada";
                }
                if (comite === true) {
                    newSev = "A";
                    newStatus = "emAnalise";
                }
                var newSS = {};
                newSS.severidade = newSev;
                newSS.status = newStatus;
                newSS.aprovadores = newAprovadores;
                const result3 = await global.conn
                    .collection("changes")
                    .updateOne({"_id" : id}, {$set: newSS});
                return { status: 200, message: "Edicao realizada com sucesso" }
            }
            else {
                return { status: 500, message: "Edicao realizada, mas algo inexperado aconteceu" }
            }
        } else if (result.modifiedCount === 0) {
            return {status: 404, message: `Mudança ${stringId}não encontrada`}
        }
    }
    catch(error) {
        console.error(error);
        return {status: 500, message: "Erro de comunicação com o banco de dados"};
    }
}

async function del (stringId) {
    // Convert o id para o formato correto
    try {
        var ObjectId = require('mongodb').ObjectID;
        var id = new ObjectId(stringId);
    }
    catch { return {status: 400, message: "Formato de id invalido"} }
    //
    try {
        const result = await global.conn
            .collection("changes")
            .deleteOne({"_id" : id});
        if (result.result.n == 1) {
            return { status: 200, message: "Deletado com sucesso" };
        }
        else { return {status: 404, message: `Mudança ${stringId} não encontrada`} }
    }
    catch(error) {
        console.error(error);
        return {status: 500, message: "Erro de comunicação com o banco de dados"};
    }
}

async function getChangesWaitingForVote (username) {

    var queryArray = [];
    queryArray.push({ status: "emAnalise" });
    queryArray.push({ "aprovadores.usuario": username.toLowerCase() });
    var query = { "$and" : queryArray };

    try {
        const result = await global.conn
            .collection("changes")
            .find(query)
            .project({titulo:1, dtExecucao:1, responsavel:1, severidade:1, status:1 })
            .sort({dtExecucao:1})
            .toArray();
        if (result.length != 0) {return { status: 200, message: result } }
        else { return {status: 204, message: "Não há mudanças para serem exibidas"} }
    } catch { return {status: 500, message: "Erro de conexão com o banco de dados"} }
}

async function sendVote (stringId, username, vote) {

    // Convert String to ObjectId()
    try {
        var ObjectId = require('mongodb').ObjectID;
        var id = new ObjectId(stringId);
    }
    catch { return {status: 400, message: "Formato de id invalido"} }

    // Check vote option
    if (vote != "approve" && vote != "comitee" && vote != "deny") {
        return {status: 400, message: "Opção de voto invalido"}
    }

    // Load change from DB
    try {
        const result = await global.conn
            .collection("changes")
            .findOne({"_id" : id});
        if (result != null) { originalChange = result }
        else { return {status: 404, message: `Mudança ${stringId} não encontrada`} }
    }
    catch { return {status: 500, message: "Erro de comunicação com o banco de dados"} }

    // Check if change status equals to "emAnalise", it's requirement
    if (originalChange.status != "emAnalise") {
        return {status: 400, message: `Mudanca ${stringId} não está com o status de em análise`}
    }


    // Look for the approval entry to modify, maybe modifing status or comitee flag
    foundApprover = novoStatusRejeitada = novoComite = naoModificarStatus = null;
    modifiedApprovers = [];
    originalChange.aprovadores.forEach(aprovador => {
        if (aprovador.usuario == username) {
            foundApprover = true;
            if (vote == "approve") { aprovador.status = "aprovada" }
            else if (vote == "comitee") {
                aprovador.status = "aprovada";
                naoModificarStatus = true;
                novoComite = true;
            }
            else {
                aprovador.status = "rejeitada";
                novoStatusRejeitada = true;
            }            
        }
        else if (aprovador.status != "aprovada") {
            naoModificarStatus = true;
        }
        modifiedApprovers.push(aprovador);
    });

    // Prepare modifications
    if (foundApprover == true) {
        modifiedChange = {};
        modifiedChange.aprovadores = modifiedApprovers;
        if (novoComite) {
            modifiedChange.comite = true;
            modifiedChange.severidade = "A";
        }
    } else {
        return {status: 400, message: `Não encontrada solicitação de aprovação sua para mudança ${stringId}`}
    }

    // Look for modifications in status
    if (novoStatusRejeitada == true) { modifiedChange.status = "rejeitada" }
    else if (naoModificarStatus == true) { /* keep it in emAnalise */}
    else { modifiedChange.status = "aprovada" }
    
    // Update the document in DB
    try {
        const result = await global.conn
            .collection("changes")
            .updateOne({"_id" : id}, {$set: modifiedChange});
        if (result.modifiedCount === 1) {
            return { status: 200, message: `Mudança ${stringId} alterada` }
        } else if (result.modifiedCount === 0) {
            return {status: 404, message: `Mudança ${stringId} não encontrada`}
        }
    }
    catch { return {status: 500, message: "Erro de comunicação com o banco de dados"} }

}

module.exports = { get, getOne, post, put, del, getChangesWaitingForVote, sendVote }