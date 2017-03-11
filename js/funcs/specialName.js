function specialName(fullname, firstname, lastname) {
  if (fullname.endsWith('bius Ngemera')) return 'but no thanks, ' + firstname + '.';
  if (fullname.startsWith('Abdou Ne')) return 'Abs ;)';
  if (fullname.startsWith('Hope Ka')) return 'Mama!';
  if (fullname.startsWith('Kunal Pat')) return 'Benchod!';
  if (fullname.startsWith('Kunal Raj')) return 'Chodu!';
  if (fullname.startsWith('Ahmed Ib')) return 'Ed!';
  if (fullname.startsWith('Mattin Mi')) return 'Mattin! The Iranians have been informed.';
  if (fullname.startsWith('Sautrik Ba')) return 'Snaketrik!';
  if (fullname.endsWith('va Ginger')) return 'Ketchup :P';
  return firstname + '!';
}