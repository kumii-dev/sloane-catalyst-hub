import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfData, password } = await req.json();

    if (!pdfData || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing pdfData or password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert base64 PDF data to Uint8Array
    const pdfBytes = Uint8Array.from(atob(pdfData), c => c.charCodeAt(0));
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Save with encryption (pdf-lib v1.17.1 supports encryption)
    const encryptedPdfBytes = await pdfDoc.save({
      userPassword: password,
      ownerPassword: password,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false,
      },
    });

    // Convert to base64 for response
    const base64Pdf = btoa(String.fromCharCode(...encryptedPdfBytes));

    return new Response(
      JSON.stringify({ encryptedPdf: base64Pdf }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error encrypting PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
