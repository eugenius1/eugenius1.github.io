function specialName(fullname, firstname) {
  if (fullname.startsWith('Eusebius Ngem')) return 'but no thanks, ' + firstname;
  if (fullname.startsWith('Abdou Ne')) return 'Abs ;)';
  if (fullname.startsWith('Hope Ka')) return 'Mama!';
  if (fullname.startsWith('Kunal Pat')) return 'Benchod!';
  if (fullname.startsWith('Kunal Raj')) return 'Chodu!';
  if (fullname.startsWith('Ahmed Ib')) return 'Ed!';
  if (fullname.startsWith('Mattin M')) return 'Mattin! The Iranians have been informed.';
  if (fullname.startsWith('Sautrik Ba')) return 'Snaketrik!';
  if (fullname.endsWith('va Ginger')) return 'Ketchup :P';
  return firstname + '!';
}