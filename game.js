// Initialize Kaboom.js
kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0, 0, 0, 1]    // Black Color
})

const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 450
const ENEMY_SPEED = 20
let CURRENT_JUMP_FORCE = JUMP_FORCE
let isJumping = true

// Images
loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')

loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc1G.png')

scene("game", ({ score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const map = [
        '                                      ',
        '                                      ',
        '                                      ',
        '                                      ',
        '                                      ',
        '                                      ',
        '                                      ',
        '      %=*=%                           ',
        '                                      ',
        '                                  -+  ',
        '                   ^   ^          ()  ',
        '============================  ========'
    ]

    // Layout of the game
    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^': [sprite('evil-shroom'), solid(), 'dangerous'],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()],     // body() to add gravity on the mushroom
    }

    const gameLevel = addLevel(map, levelCfg)

    const scoreLabel = add([
        text(score),
        pos(30, 6),
        layer('ui'),
        {
            value: score
        }
    ])

    add([text('level ' + 'test', pos(4, 6))])

    // Add Mario
    const player = add([
        sprite('mario'),
        solid(),        // Prevent Mario from passing through ground
        pos(30, 0),
        body(),
        big(),
        origin('bot')
    ])

    // Make the mushroom move
    action('mushroom', m => {
        m.move(30, 0);
    })
    // Move the enemy
    action('dangerous', m => {
        m.move(-ENEMY_SPEED, 0);
    })

    player.on("headbump", obj => {
        if (obj.is('coin-surprise')) {
            // Show Coin
            gameLevel.spawn('$', obj.gridPos.sub(0, 1))
            // Remove Box
            destroy(obj)
            // Show Empty Box
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
        if (obj.is('mushroom-surprise')) {
            // Show Mushroom
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))
            // Remove Box
            destroy(obj)
            // Show Empty Box
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
    })

    player.collides('mushroom', m => {
        destroy(m)
        // Make Mario big
        player.biggify(6)
    })

    player.collides('coin', c => {
        destroy(c)
        // Add points
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })

    player.collides('dangerous', d => {
        if (isJumping) {
            destroy(d)
        } else {
            go('lose', { score: scoreLabel})
        }
    })

    player.action(() => {
        if (player.grounded()) {
            isJumping = false
        }
    })

    // Controls for Mario
    keyDown('left', () => {
        // (x-axis, y-axis)
        player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
        // (x-axis, y-axis)
        player.move(MOVE_SPEED, 0)
    })

    keyDown('space', () => {
        if (player.grounded()) {
            isJumping = true
            player.jump(CURRENT_JUMP_FORCE)
        }
    })

    function big() {
        let timer = 0
        let isBig = false
        return {
            update() {
                if (isBig) {
                    CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                    timer -= dt()

                    if (timer <= 0) {
                        this.smallify()
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1)
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time) {
                this.scale = vec2(2)
                timer = time
                isBig = true
            }
        }
    }
})

scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
  })

start("game", { score: 0 })