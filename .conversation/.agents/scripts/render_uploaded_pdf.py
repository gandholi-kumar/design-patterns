from pathlib import Path
import fitz

pdfs = sorted(Path("attached_assets").glob("*.pdf"))
if len(pdfs) != 1:
    raise SystemExit(f"Expected one attached PDF, found {len(pdfs)}: {pdfs}")
pdf_path = pdfs[0]
doc = fitz.open(pdf_path)
output_dir = Path(".agents/outputs")
text_path = output_dir / "uploaded-pdf-text.md"
with text_path.open("w", encoding="utf-8") as out:
    out.write(f"# {pdf_path.name}\n\nPages: {doc.page_count}\n")
    for index, page in enumerate(doc, start=1):
        out.write(f"\n\n---\n\n## Page {index}\n\n")
        out.write(page.get_text(sort=True))
        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        pix.save(output_dir / f"uploaded-pdf-page-{index:02}.png")
print(f"PDF: {pdf_path}\nPages: {doc.page_count}\nText: {text_path}\nRenders: {output_dir}/uploaded-pdf-page-*.png")
