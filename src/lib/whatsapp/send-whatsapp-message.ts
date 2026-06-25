export async function sendWhatsAppMessage(
    phoneNumber: string,
    text: string
  ) {
  
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
              "text",
            text: {
              body:
                text
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