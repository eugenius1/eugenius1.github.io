function specialName(fullname, firstname, lastname) {
  if (fullname.endsWith('bius Ngemera')) return 'but no thanks, ' + firstname + '.';
  if (fullname.endsWith('dou Nezezra')) return 'Abs ;)';
  if (fullname.endsWith('ope Katanga')) return 'Mama!';
  if (fullname.endsWith('eri Katanga')) return 'Dad!';
  if (fullname.endsWith('nal Rajendrakumar Patel')) return 'Special K!';
  if (fullname.endsWith('ed Ibrahim')) return 'Ed!';
  if (fullname.endsWith('tin Mir-Tahmasebi')) return 'M! The Iranians have been informed.';
  if (fullname.endsWith('trik Banerjee')) return 'Snaketrik!';
  if (fullname.endsWith('va Ginger')) return 'Ketchup :P';
  return firstname + '!';
}