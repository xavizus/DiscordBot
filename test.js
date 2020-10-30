const words = ["hello","racecar","park","spark","hihih","soup","paris", "hiih", 'hejsan', 'tattarrattat'];

function reverse2(word) {
    let halfWordLength = parseInt(word.length / 2);
    let offset = word.length -1;
    for (let index = 0; index < halfWordLength; index++) {
        if (word[index] === word[offset - index]) {
            continue;
        } else {
            return false;
        }
    }
    return true;
}

words.forEach(word => {
    console.log(reverse2(word) ? 'True' : 'False');
});



const string = "!play https://www.youtube.com/watch?v=pw9DYgs5flc penis"

let [command, ...args] = string.split(" ");