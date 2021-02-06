db.createCollection('changes', { 
    validator: { $jsonSchema: { 
       bsonType: "object", 
       required: [ "titulo", "dtExecucao", "responsavel", "impactoRisco", "severidade", "status", "dtCriacao"  ],
       properties: {
            titulo: { bsonType: "string" },
            dtExecucao: { bsonType: "date" },
            responsavel: { bsonType: "string" },
            impactoRisco: { bsonType: "string" },
            severidade: {
                bsonType: "string",
                enum: [ "A", "B", "C" ]
            },
            status: {
                bsonType: "string",
                enum: [ "emAnalise", "aprovada", "rejeitada" ]
            },
            dtCriacao: { bsonType: "date" },
            descricao: { bsonType: "string" },
            aprovadores: {
                bsonType: ["array"],
                items: {
                    bsonType: ["object"],
                    required: [ "usuario", "status" ],
                    properties: {
                        usuario: {
                            bsonType: "string"
                        },
                        status: {
                            bsonType: "string",
                            enum: [ "emAnalise", "aprovada", "rejeitada" ]
                        }
                    }
                }
            },
            comite: { bsonType: "bool" },
            rotineira: { bsonType: "bool" },
            associacao: { bsonType: "string" },
            notificacaoTi: {
                bsonType: "array",
                items: {
                    bsonType: "string",
                    enum: [ "GGT", "GOT", "GSI" ]
                }
            },
            notificados: {
                bsonType: "array",
                items: { bsonType: "string" }
            },
            naoProgramada: { bsonType: "bool" }
       }
    }
}});