function Rectangle(x, y, width, height, static = false){
  this.isStatic = static;
  //creates new body
  this.newRect = Bodies.rectangle(x, y, width, height, { isStatic: static });
  //creates width and height properties because they are not in bodies automatically
  this.width = width;
  this.height = height;
  context.fillStyle = colors[Math.floor(Math.random()*(colors.length - 1))];
}

//translates and rotates the inputted body to the correct angle/position
Rectangle.prototype.run = function(){
  //checks if it is a ground or a moving object
  if(!this.isStatic){
    context.save();
    context.translate(this.newRect.position.x, this.newRect.position.y);
    var direction = this.newRect.angle;
    context.rotate(direction);
    context.fillRect(-.5*this.width, -.5*this.height, this.width, this.height);
    context.restore();
  } else {
    //creates ground if isStatic is true
    context.fillStyle = "rgb(46,139,87)";
    context.fillRect(this.newRect.position.x-.5*this.width, this.newRect.position.y-.5*this.height, this.width, this.height);
  }
}