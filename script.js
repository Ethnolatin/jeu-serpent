window.onload = function() {

  var canvasWidth = 900,
      canvasHeight = 600,
      centerX = canvasWidth / 2,
      centerY = canvasHeight / 2,
      blockSize = 30,
      ctx,
      delay = 200,
      snakee,
      applee,
      widthInBlocks = canvasWidth / blockSize,
      heightInBlocks = canvasHeight / blockSize,
      score,
      timeout

  init()

  function init() {
    var canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.border = "1px solid"
    canvas.style.margin = "50px auto"
    canvas.style.display = "block"
    canvas.style.backgroundColor = "#ddd"
    document.body.appendChild(canvas)
    ctx = canvas.getContext('2d')
    start()
  }

  function refreshCanvas() {
    snakee.advance()
    if (snakee.checkCollision()) {
      console.log("GAME OVER")
      gameOver()
    }
    else {
      if (snakee.isEatingApple(applee)) {
        console.log("MIAM !")
        score++
        snakee.ateApple = true
        do {
          applee.setNewPosition()
        }
        while (applee.isOnSnake(snakee))
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      drawScore()
      snakee.draw()
      applee.draw()
      timeout = setTimeout(refreshCanvas, delay)
    }
  }

  function start() {
    var snakePosition = Math.round(heightInBlocks/2-1)
    snakee = new Snake([[4,snakePosition],[3,snakePosition],[2,snakePosition]], "right")
    var applePosition = newPosition()
    applee = new Apple(applePosition)
    score = 0
    clearTimeout(timeout)
    refreshCanvas()
  }

  function gameOver() {
    ctx.save()
    ctx.font = "bold 70px sans-serif"
    ctx.fillStyle = "black"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.strokeStyle = "white"
    ctx.lineWidth = 5
    ctx.strokeText("Game Over", centerX, centerY - 180)
    ctx.fillText("Game Over", centerX, centerY - 180)
    ctx.font = "bold 30px sans-serif"
    ctx.strokeText('Appuie sur la barre "espace" pour rejouer', centerX, centerY - 120)
    ctx.fillText('Appuie sur la barre "espace" pour rejouer', centerX, centerY - 120)
    ctx.restore()
  }

  function drawScore() {
    ctx.save()
    ctx.font = "bold 200px sans-serif"
    ctx.fillStyle = "gray"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(score.toString(), centerX, centerY)
    ctx.restore()
  }

  function drawBlock(ctx, position) {
    var x = position[0] * blockSize
    var y = position[1] * blockSize
    ctx.fillRect(x,y, blockSize, blockSize)
  }

  function Snake(body, direction) {
    this.body = body
    this.direction = direction
    this.ateApple = false
    this.draw = function() {
      ctx.save()
      ctx.fillStyle = "#f00"
      for(i = 0; i < this.body.length; i++) {
        drawBlock(ctx,this.body[i])
      }
      ctx.restore()
    }
    this.advance = function() {
      var nextPosition = this.body[0].slice()
      switch(this.direction)
      {
        case "left":
          nextPosition[0] -= 1
          break
        case "right":
          nextPosition[0] += 1
          break
        case "down":
          nextPosition[1] += 1
          break
        case "up":
          nextPosition[1] -= 1
          break
        default:
          throw("Invalid direction")
      }
      this.body.unshift(nextPosition)
      if (!this.ateApple) {
        this.body.pop()
      }
      this.ateApple = false
    }
    this.setDirection = function(newDirection) {
      var allowedDirections
      switch (this.direction) {
        case "left":
        case "right":
          allowedDirections = ["up", "down"]
          break
        case "down":
        case "up":
          allowedDirections = ["left", "right"]
          break
        default:
          throw("Invalid direction")
      }
      if (allowedDirections.indexOf(newDirection) > -1) {
        this.direction = newDirection
      }
    }
    this.checkCollision = function() {
      var wallCollision = false
      var snakeCollision = false
      var head = this.body[0]
      var rest = this.body.slice(1)
      var snakeX = head[0]
      var snakeY = head[1]
      var minX = 0
      var minY = 0
      var maxX = widthInBlocks - 1
      var maxY = heightInBlocks - 1
      var outOfHorizontalWalls = snakeX < minX || snakeX > maxX
      var outOfVerticalWalls = snakeY < minY || snakeY > maxY
      wallCollision = outOfHorizontalWalls || outOfVerticalWalls
      if (wallCollision) return true
      for (i = 0; i < rest.length; i++) {
        snakeCollision = snakeX === rest[i][0] && snakeY === rest[i][1]
        if (snakeCollision) {
          console.log("OUCH !")
          return true
        }
      }
      return snakeCollision || wallCollision
    }

    this.isEatingApple = function(appleToEat) {
      var head = this.body[0]
      var snakeX = head[0]
      var snakeY = head[1]
      return (snakeX === appleToEat.position[0] && snakeY === appleToEat.position[1])
    }
  }

  function newPosition() {
    var newX = Math.round(Math.random() * (widthInBlocks - 1))
    var newY = Math.round(Math.random() * (heightInBlocks - 1))
    return [newX, newY]
  }

  function Apple(position) {
    this.position = position
    this.draw = function() {
      ctx.save()
      ctx.fillStyle = "#3c3"
      ctx.beginPath()
      var radius = blockSize / 2
      var x = this.position[0]*blockSize+radius
      var y = this.position[1]*blockSize+radius
      ctx.arc(x, y, radius, 0, Math.PI*2, true)
      ctx.fill()
      ctx.restore()
    }
    this.setNewPosition = function() {
      this.position = newPosition()
    //   var newX = Math.round(Math.random() * (widthInBlocks - 1))
    //   var newY = Math.round(Math.random() * (heightInBlocks - 1))
    //   this.position = [newX, newY]
    }
    this.isOnSnake = function(snakeToCheck) {
      var onSnake = false
      for (i = 0; i < snakeToCheck.body.length; i++) {
        console.log(i,this.position[0],snakeToCheck.body[i][0],this.position[1],snakeToCheck.body[i][1]);
        if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
          console.log("AÏE !")
          onSnake = true
        }
      }
      return onSnake
    }
  }

  document.onkeydown = function handleKeyDown(e) {
    var key = e.keyCode
    var newDirection
    switch(key) {
      case 37:
        newDirection = "left"
        break
      case 38:
        newDirection = "up"
        break
      case 39:
        newDirection = "right"
        break
      case 40:
        newDirection = "down"
        break
      case 32:
        start()
        return
      default:
        return
    }
    snakee.setDirection(newDirection)
  }

}
