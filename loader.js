let time = 0;
export default function(source) {
  time++;
  console.log('time', time);
  if (time === 2) {
    return source.replaceAll('blue', 'red')
  }
  return source.replaceAll('blue', 'green')
}
