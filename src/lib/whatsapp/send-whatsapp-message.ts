export async function sendWhatsAppMessage(
    phoneNumber: string,
    text: string
  ) {
  
    const body = {
        messaging_product:
          "whatsapp",
        to:
          phoneNumber,
        type:
          "text",
        text: {
          body:
            text
        }
      };

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