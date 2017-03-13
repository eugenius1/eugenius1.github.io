function specialName(fullname, firstname, lastname) {
  if (fullname.endsWith('bius Ngemera')) return 'but no thanks, ' + firstname + '.';
  if (fullname.endsWith('ou Nezezra')) return 'Abs ;)';
  if (fullname.endsWith('pe Katanga')) return 'Mama!';
  if (fullname.endsWith('Kunal Patel')) return 'Special K!';
  if (fullname.endsWith('al Rajendrakumar Patel')) return 'Chodu :)';
  if (fullname.endsWith('ed Ibrahim')) return 'Ed!';
  if (fullname.endsWith('in Mir-Tahmasebi')) return 'M! The Iranians have been informed.';
  if (fullname.endsWith('ik Banerjee')) return 'Snaketrik!';
  if (fullname.endsWith('va Ginger')) return 'Ketchup :P';
  return firstname + '!';
}