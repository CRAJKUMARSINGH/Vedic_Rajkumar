export function formatDate(d: Date): string {
  const months = ['जन', 'फर', 'मार्च', 'अप्र', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्त', 'नव', 'दिस'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateEn(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
