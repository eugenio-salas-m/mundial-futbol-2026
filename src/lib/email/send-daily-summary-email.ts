import { Resend } from "resend";

const resend =
  new Resend(
    process.env.RESEND_API_KEY
  );

export async function sendDailySummaryEmail(
  recipients: string[],
  summaryText: string
) {

  if (
    recipients.length === 0
  ) {
    return;
  }

  await resend.emails.send({

    from:
      "Mundial Futbol 2026 <esalas@nubesys.cl>",

    to: recipients,

    subject:
      "🏆 Resumen Diario Mundial 2026",

    text:
`${summaryText}

Revisa el ranking completo:

https://mundial-futbol-2026-beta.vercel.app`

  });

}