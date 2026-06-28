type WhatsAppTemplateParameter =
  | string
  | {
      name: string;
      value: string;
    };

type SendWhatsAppTemplateRequest = {
  phoneNumber: string;
  templateName: string;
  languageCode: string;
  parameters: WhatsAppTemplateParameter[];
};

export async function sendWhatsAppTemplate({
    phoneNumber,
    templateName,
    languageCode,
    parameters
  }: SendWhatsAppTemplateRequest) {
  
    console.log(
      `[WHATSAPP] ${templateName} -> ${phoneNumber}`
    );


    const body = {
      messaging_product:
        "whatsapp",
      to:
        phoneNumber,
      type:
        "template",
      template: {
        name:
          templateName,
        language: {
          code:
            languageCode
        },
        components: [
          {
            type: "body",
            parameters:
              parameters.map(parameter => {
                if (
                  typeof parameter === "string"
                ) {
                  return {
                    type: "text",
                    text: parameter
                  };
                }
                return {
                  type: "text",
                  parameter_name:
                    parameter.name,
                  text:
                    parameter.value
                };
              })
          }
        ]
      }
    } as const;

    const response =
      await fetch(
        `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(body)
        }
      );
  
    const data =
      await response.json();
  
    if (!response.ok) {
      throw new Error(
        JSON.stringify(data)
      );
    }
  
    return {
      providerMessageId:
        data.messages?.[0]?.id ?? null,
      providerResponse:
        data,
      requestPayload:
        body
    };
  
}