export const whatsappTemplates = {
    reminder_prediction: {
      label: "Recordatorio de pronósticos",
      languageCode: "es_CL"
    },
  
    ranking_update: {
      label: "Actualización de ranking",
      languageCode: "es_CL"
    },
  
    match_result: {
      label: "Resultado de partido",
      languageCode: "es_CL"
    },
    
    hello_world: {
        label: "Prueba Meta",
        languageCode: "en_US"
      }

  };
  
  export type WhatsAppTemplateCode =
    keyof typeof whatsappTemplates;