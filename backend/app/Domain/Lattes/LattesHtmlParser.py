from bs4 import BeautifulSoup
import json
import re
import os
from pathlib import Path

def parse_li_tag(li_tag):
    full_text = li_tag.get_text(separator=' ', strip=True)

    title_tag = li_tag.find('b')
    title = title_tag.get_text(strip=True) if title_tag else None

    journal_tag = li_tag.find('font', color="#330066")
    journal = journal_tag.get_text(strip=True) if journal_tag else None

    # Look for Qualis tag with either color #254117 or #F88017
    qualis_tag = li_tag.find(lambda tag: tag.name == 'font' and tag.get('color') in ['#254117', '#F88017'])
    qualis = qualis_tag.get_text(strip=True).replace("Qualis: ", "") if qualis_tag else None

    link_tag = li_tag.find('a')
    link = link_tag['href'] if link_tag and link_tag.has_attr('href') else None

    raw_html = str(li_tag)
    pre_title_text = raw_html.split('<b>')[0]
    soup_pre_title = BeautifulSoup(pre_title_text, 'html.parser')
    authors = soup_pre_title.get_text(separator=' ', strip=True).rstrip('.')

    volume = re.search(r'v\.\s?(\d+)', full_text)
    pages = re.search(r'p\.\s?([\d\-–]+)', full_text)
    issn = re.search(r'issn:\s?([\d\-xX]+)', full_text)
    year = re.search(r'\b(20\d{2})\b', full_text)

    return {
        "autores": authors,
        "titulo": title,
        "revista": journal,
        "volume": volume.group(1) if volume else None,
        "paginas": pages.group(1) if pages else None,
        "issn": issn.group(1) if issn else None,
        "ano": year.group(1) if year else None,
        "link": link,
        "qualis": qualis
    }

def process_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    start_h3_list = soup.find_all('h3', string="Produção bibliográfica")
    if not start_h3_list or len(start_h3_list) < 2:
        print(f'[✘] "Produção bibliográfica" não encontrada corretamente em {file_path.name}')
        return {}

    start_h3 = start_h3_list[1]
    ul = start_h3.find_next_sibling()

    producoes = []

    if ul and ul.name == 'ul':
        for li in ul.find_all('li', recursive=False):
            ol = li.find('ol')
            if ol:
                for sub_li in ol.find_all('li'):
                    producoes.append(parse_li_tag(sub_li))

    return producoes

# Diretórios
html_folder = Path("storage/app/Lattes/html")
output_folder = Path("storage/app/Lattes/json")
output_folder.mkdir(parents=True, exist_ok=True)

merged_data = {}

for html_file in html_folder.glob("*.html"):
    print(f"[→] Processando {html_file.name}...")
    producoes = process_html_file(html_file)

    id_membro = html_file.stem.replace("membro-", "")
    merged_data[id_membro] = producoes

with open(output_folder / "todas_producoes.json", 'w', encoding='utf-8') as f:
    json.dump(merged_data, f, ensure_ascii=False, indent=2)

print(f"[✔] JSON geral salvo em: {output_folder / 'todas_producoes.json'}")
