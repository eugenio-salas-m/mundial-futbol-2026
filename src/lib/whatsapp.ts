export async function sendWhatsAppTemplate(
    phoneNumber: string,
    templateName: string,
    languageCode: string,
    parameters: string[]
  ) {
  
    console.log(
        "PHONE ID:",
        process.env.WHATSAPP_PHONE_NUMBER_ID
      );
      
      console.log(
        "TOKEN:",
        process.env.WHATSAPP_ACCESS_TOKEN
      );

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
          body: JSON.stringify({
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
                    parameters.map(
                      value => ({
                        type: "text",
                        text: value
                      })
                    )
                }
              ]
            }
          })
        }
      );
  
    const data =
      await response.json();
  
    if (!response.ok) {
      throw new Error(
        JSON.stringify(data)
      );
    }
  
    return data;
  
  }