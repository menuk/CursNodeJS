console.log('im b')

function Square (side) {
    this.x = 0
    this.y = 0
    this.width = side
    this.height = side
}
Square.prototype.area = function () {
    return this.width * this.height
}
  
const sq = new Square(30)
console.log(sq.area())

/*
class Rect {
    constructor (width, height) {
        this.x = 0
        this.y = 0
        this.width = width
        this.height = height
    }

    area () {
        return this.width * this.height
    }
}

const rect = new Rect(20, 40)
console.log(rect.area())

*/

//module.export = {}

module.exports = Square
