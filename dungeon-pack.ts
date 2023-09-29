/**
 * ダンジョンパック
 * https://github.com/microsoft/pxt-common-packages/blob/master/libs/game/animation.ts#L589
 */
//% weight=150 color=#e67e22 icon="\uf3ed" block="ダンジョンパック"
namespace dungeon_pack {
    const stateNamespace = "__dungeon_pack";

    enum SpriteDirection {
        UP,
        RIGHT,
        DOWN,
        LEFT
    }

    type AngleData = {
        direction: SpriteDirection,
        value: number,
        active: boolean
    }

    type MoveData = {
        elaspedTime: number,
        frameInterval: number,
        direction: SpriteDirection,
        currentFrames: Image[],
        upFrames: Image[],
        upLastFrame: number,
        upLastUpdated: number,
        rightFrames: Image[],
        rightLastFrame: number,
        rightLastUpdated: number,
        downFrames: Image[],
        downLastFrame: number,
        downLastUpdated: number,
        leftFrames: Image[],
        leftLastFrame: number,
        leftLastUpdated: number
    }

    type AttackData = {
        attackingSprite: Sprite | null,
        kind: number,
        elaspedTime: number,
        frameInterval: number,
        offset: number,
        attacking: boolean,
        direction: SpriteDirection,
        lastFrame: number,
        lastUpdated: number,
        upFrames: Image[],
        rightFrames: Image[],
        downFrames: Image[],
        leftFrames: Image[],
        upSpriteFrames: Image[],
        rightSpriteFrames: Image[],
        downSpriteFrames: Image[],
        leftSpriteFrames: Image[]
    }

    type SpriteAnimationData = {
        sprite: Sprite,
        angle?: AngleData,
        move?: MoveData,
        attack?: AttackData
    }


    /**
     * スプライトの向きを管理する
     */
    //% block="$sprite=variables_get(mySprite) の向きを管理する"
    //% weight=101
    export function manageDirection(sprite: Sprite) {
        if (!sprite) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteAnimationData = spriteDicts[spriteId]
                    if (!data.angle || data.angle.active) {
                        continue
                    }
                    const sprite = data.sprite
                    if (sprite.vx === 0 && sprite.vy === 0) {
                        continue
                    }
                    data.angle.value = Math.atan2(sprite.vy, sprite.vx)
                    if (Math.abs(sprite.vx) > Math.abs(sprite.vy)) {
                        if (sprite.vx > 0) {
                            data.angle.direction = SpriteDirection.RIGHT
                        } else {
                            data.angle.direction = SpriteDirection.LEFT
                        }
                    } else {
                        if (sprite.vy > 0) {
                            data.angle.direction = SpriteDirection.DOWN
                        } else {
                            data.angle.direction = SpriteDirection.UP
                        }
                    }
                }
            })
        }
        sprite.onDestroyed(() => {
            spriteDicts[sprite.id].active = false
        })
        const data = {
            direction: SpriteDirection.DOWN,
            value: Math.PI * 0.5,
            active: true
        } as AngleData
        if (spriteDicts[sprite.id]) {
            spriteDicts[sprite.id].angle = data
        } else {
            spriteDicts[sprite.id] = {
                sprite: sprite,
                angle: data
            } as SpriteAnimationData
        }
    }

    /**
     * 移動アニメーションを設定する
     */
    //% block="移動アニメーションを設定する $sprite=variables_get(mySprite) 上方向 $upFrames=animation_editor 右方向 $rightFrames=animation_editor 下方向 $downFrames=animation_editor 左方向 $leftFrames=animation_editor フレーム間隔 (ms) $frameInterval=timePicker"
    //% frameInterval.defl=100
    //% weight=100
    export function setMoveAnimation(sprite: Sprite, upFrames: Image[], rightFrames: Image[], downFrames: Image[], leftFrames: Image[], frameInterval?: number) {
        if (!sprite) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteAnimationData = spriteDicts[spriteId]
                    const sprite = data.sprite
                    if (sprite.vx === 0 && sprite.vy === 0) {
                        if (data.attack && data.attack.attacking) continue

                        const image = data.move.currentFrames[0]
                        if (sprite.image !== image) sprite.setImage(image)
                        data.move.upLastFrame = 0
                        data.move.rightLastFrame = 0
                        data.move.downLastFrame = 0
                        data.move.leftLastFrame = 0
                        continue
                    }

                    data.move.elaspedTime += game.eventContext().deltaTimeMillis
                    if (Math.abs(sprite.vx) > Math.abs(sprite.vy)) {
                        if (sprite.vx > 0) {
                            data.move.direction = SpriteDirection.RIGHT
                            if (data.move.elaspedTime - data.move.rightLastUpdated > data.move.frameInterval) {
                                data.move.rightLastUpdated = data.move.elaspedTime
                                data.move.rightLastFrame = (data.move.rightLastFrame + 1) % data.move.rightFrames.length
                                const image = data.move.rightFrames[data.move.rightLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.move.currentFrames = data.move.rightFrames
                            }
                        } else if (sprite.vx < 0) {
                            data.move.direction = SpriteDirection.LEFT
                            if (data.move.elaspedTime - data.move.leftLastUpdated > data.move.frameInterval) {
                                data.move.leftLastUpdated = data.move.elaspedTime
                                data.move.leftLastFrame = (data.move.leftLastFrame + 1) % data.move.leftFrames.length
                                const image = data.move.leftFrames[data.move.leftLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.move.currentFrames = data.move.leftFrames
                            }
                        }
                    } else {
                        if (sprite.vy > 0) {
                            data.move.direction = SpriteDirection.DOWN
                            if (data.move.elaspedTime - data.move.downLastUpdated > data.move.frameInterval) {
                                data.move.downLastUpdated = data.move.elaspedTime
                                data.move.downLastFrame = (data.move.downLastFrame + 1) % data.move.downFrames.length
                                const image = data.move.downFrames[data.move.downLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.move.currentFrames = data.move.downFrames
                            }
                        } else if (sprite.vy < 0) {
                            data.move.direction = SpriteDirection.UP
                            if (data.move.elaspedTime - data.move.upLastUpdated > data.move.frameInterval) {
                                data.move.upLastUpdated = data.move.elaspedTime
                                data.move.upLastFrame = (data.move.upLastFrame + 1) % data.move.upFrames.length
                                const image = data.move.upFrames[data.move.upLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.move.currentFrames = data.move.upFrames
                            }
                        }
                    }
                }
            })
        }
        /*
        sprite.onDestroyed(() => {
            delete spriteDicts[sprite.id]
        })
        */
        const data = {
            elaspedTime: 0,
            frameInterval: frameInterval,
            direction: SpriteDirection.DOWN,
            currentFrames: [sprite.image],
            upFrames: upFrames,
            upLastFrame: 0,
            upLastUpdated: 0,
            rightFrames: rightFrames,
            rightLastFrame: 0,
            rightLastUpdated: 0,
            downFrames: downFrames,
            downLastFrame: 0,
            downLastUpdated: 0,
            leftFrames: leftFrames,
            leftLastFrame: 0,
            leftLastUpdated: 0

        } as MoveData
        if (spriteDicts[sprite.id]) {
            spriteDicts[sprite.id].move = data
        } else {
            spriteDicts[sprite.id] = {
                sprite: sprite,
                move: data
            } as SpriteAnimationData
        }
    }

    /**
     * 攻撃アニメーションを設定する
     */
    //% block="攻撃アニメーションを設定する $sprite=variables_get(mySprite) 上方向 $upFrames=animation_editor 右方向 $rightFrames=animation_editor 下方向 $downFrames=animation_editor 左方向 $leftFrames=animation_editor 武器タイプ %kind=spritekind オフセット (px) %offset フレーム間隔 (ms) $frameInterval=timePicker || スプライト上方向　$upSpriteFrames=animation_editor スプライト右方向　$rightSpriteFrames=animation_editor スプライト下方向　$downSpriteFrames=animation_editor スプライト左方向　$leftSpriteFrames=animation_editor"
    //% offset.defl=0
    //% frameInterval.defl=100
    //% upSpriteFrames.defl=[]
    //% rightSpriteFrames.defl=[]
    //% downSpriteFrames.defl=[]
    //% leftSpriteFrames.defl=[]
    //% expandableArgumentMode="toggle"
    //% weight=99
    export function setAttackAnimation(sprite: Sprite, upFrames: Image[], rightFrames: Image[], downFrames: Image[], leftFrames: Image[], kind: number, offset: number, frameInterval: number,
        upSpriteFrames?: Image[], rightSpriteFrames?: Image[], downSpriteFrames?: Image[], leftSpriteFrames?: Image[]) {
        if (!sprite) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
            game.eventContext().registerFrameHandler(scene.FOLLOW_SPRITE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteAnimationData = spriteDicts[spriteId]
                    const sprite = data.sprite
                    if (Math.abs(sprite.vx) > Math.abs(sprite.vy)) {
                        if (sprite.vx > 0) {
                            data.attack.direction = SpriteDirection.RIGHT
                        } else if (sprite.vx < 0) {
                            data.attack.direction = SpriteDirection.LEFT
                        }
                    } else {
                        if (sprite.vy > 0) {
                            data.attack.direction = SpriteDirection.DOWN
                        } else if (sprite.vy < 0) {
                            data.attack.direction = SpriteDirection.UP
                        }
                    }
                    if (data.attack.attacking && data.attack.attackingSprite) {
                        let x = data.sprite.x
                        let y = data.sprite.y
                        if (data.attack.direction === SpriteDirection.UP) {
                            y = data.sprite.top - data.attack.offset
                        } else if (data.attack.direction === SpriteDirection.RIGHT) {
                            x = data.sprite.right + data.attack.offset
                        } else if (data.attack.direction === SpriteDirection.DOWN) {
                            y = data.sprite.bottom + data.attack.offset
                        } else if (data.attack.direction === SpriteDirection.LEFT) {
                            x = data.sprite.left - data.attack.offset
                        }
                        data.sprite.setVelocity(0, 0)
                        data.attack.attackingSprite.setPosition(x, y)
                    }
                }
            })
            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteAnimationData = spriteDicts[spriteId]
                    const sprite = data.sprite
                    if (data.attack.attacking) {
                        let frames: Image[] = []
                        let spriteFrames: Image[] = []
                        if (data.attack.direction === SpriteDirection.UP) {
                            frames = data.attack.upFrames
                            spriteFrames = data.attack.upSpriteFrames
                        } else if (data.attack.direction === SpriteDirection.RIGHT) {
                            frames = data.attack.rightFrames
                            spriteFrames = data.attack.rightSpriteFrames
                        } else if (data.attack.direction === SpriteDirection.DOWN) {
                            frames = data.attack.downFrames
                            spriteFrames = data.attack.downSpriteFrames
                        } else if (data.attack.direction === SpriteDirection.LEFT) {
                            frames = data.attack.leftFrames
                            spriteFrames = data.attack.leftSpriteFrames
                        }
                        data.attack.elaspedTime += game.eventContext().deltaTimeMillis
                        if (data.attack.elaspedTime - data.attack.lastUpdated > data.attack.frameInterval) {
                            data.attack.lastUpdated = data.attack.elaspedTime
                            data.attack.lastFrame += 1
                            if (data.attack.lastFrame === 0) {
                                if (data.attack.attackingSprite) data.attack.attackingSprite.destroy()
                                data.attack.attackingSprite = sprites.create(frames[0], kind)
                                data.attack.attackingSprite.z = data.sprite.z - 1
                                let x = data.sprite.x
                                let y = data.sprite.y
                                if (data.attack.direction === SpriteDirection.UP) {
                                    y = data.sprite.top - data.attack.offset
                                } else if (data.attack.direction === SpriteDirection.RIGHT) {
                                    x = data.sprite.right + data.attack.offset
                                } else if (data.attack.direction === SpriteDirection.DOWN) {
                                    y = data.sprite.bottom + data.attack.offset
                                } else if (data.attack.direction === SpriteDirection.LEFT) {
                                    x = data.sprite.left - data.attack.offset
                                }
                            }
                            if (data.attack.lastFrame < frames.length) {
                                const image = frames[data.attack.lastFrame]
                                if (data.attack.attackingSprite.image !== image) {
                                    data.attack.attackingSprite.setImage(image)
                                }
                                if (spriteFrames && spriteFrames.length > 1) {
                                    const image = spriteFrames[data.attack.lastFrame]
                                    if (data.sprite.image !== image) {
                                        data.sprite.setImage(image)
                                    }
                                }
                                data.attack.attackingSprite.setPosition(data.sprite.x, data.sprite.y)
                            } else {
                                if (data.attack.attackingSprite) data.attack.attackingSprite.destroy()
                                if (spriteFrames && spriteFrames.length > 1) {
                                    const image = spriteFrames[0]
                                    data.sprite.setImage(image)
                                }
                                data.attack.attacking = false
                            }
                        }
                    }
                }
            })
        }
        const data = {
            attackingSprite: null,
            kind: kind,
            elaspedTime: 0,
            frameInterval: frameInterval,
            offset: offset,
            currentFrames: [sprite.image],
            attacking: false,
            direction: SpriteDirection.DOWN,
            lastFrame: -1,
            lastUpdated: 0,
            upFrames: upFrames,
            rightFrames: rightFrames,
            downFrames: downFrames,
            leftFrames: leftFrames,
            upSpriteFrames: upSpriteFrames,
            rightSpriteFrames: rightSpriteFrames,
            downSpriteFrames: downSpriteFrames,
            leftSpriteFrames: leftSpriteFrames
        } as AttackData
        if (spriteDicts[sprite.id]) {
            spriteDicts[sprite.id].attack = data
        } else {
            spriteDicts[sprite.id] = {
                sprite: sprite,
                attack: data
            } as SpriteAnimationData
        }
        /*
        sprite.onDestroyed(() => {
            delete spriteDicts[sprite.id]
        })
        */
    }

    /**
     * 攻撃する
     */
    //% block="$sprite=variables_get(mySprite) が攻撃する"
    //% weight=98
    export function attack(sprite: Sprite) {
        if (!sprite) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
        }
        const data = spriteDicts[sprite.id] as SpriteAnimationData
        if (!data || data.attack.attacking) return

        data.attack.attacking = true
        data.attack.lastFrame = -1
        data.attack.lastUpdated = 0
    }

    /**
     * 発射体を発射する
     */
    //% block="発射体を発射する $sprite=variables_get(mySprite) 上方向 $upFrames=animation_editor 右方向 $rightFrames=animation_editor 下方向 $downFrames=animation_editor 左方向 $leftFrames=animation_editor 速度 %velocity 武器タイプ %kind=spritekind オフセット (px) %offset フレーム間隔 (ms) $frameInterval=timePicker"
    //% velocity.defl=50
    //% offset.defl=0
    //% frameInterval.defl=100
    //% weight=97
    export function shootProjectile(sprite: Sprite, upFrames: Image[], rightFrames: Image[], downFrames: Image[], leftFrames: Image[], velocity: number, kind: number, offset: number, frameInterval?: number) {
        if (!sprite) return

        let frames: Image[] = downFrames
        let x = sprite.x
        let y = sprite.y + offset
        let vx = 0
        let vy = velocity
        const dataKey = stateNamespace
        let spriteDicts = game.currentScene().data[dataKey]
        if (spriteDicts && spriteDicts[sprite.id]) {
            const data = spriteDicts[sprite.id]
            if (!data.active) {
                return
            }
            x = sprite.x + offset * Math.cos(data.angle)
            y = sprite.y + offset * Math.sin(data.angle)
            vx = velocity * Math.cos(data.angle)
            vy = velocity * Math.sin(data.angle)
            const direction = data.direction
            if (direction === SpriteDirection.UP) {
                frames = upFrames
            } else if (direction === SpriteDirection.RIGHT) {
                frames = rightFrames
            } else if (direction === SpriteDirection.DOWN) {
                frames = downFrames
            } else {
                frames = leftFrames
            }
        }
        const projectile = sprites.create(frames[0], kind)
        projectile.setPosition(x, y)
        projectile.setVelocity(vx, vy)
        projectile.setFlag(SpriteFlag.DestroyOnWall, true)
        projectile.setFlag(SpriteFlag.AutoDestroy, true)
        animation.runImageAnimation(projectile, frames, frameInterval, true)
    }

    /**
     * タイル上にスプライトを生成する
     */
    //% block="スプライト%sprite=screen_image_picker (%kind=spritekind タイプ)をタイル%tile 上に生成する || (速度 vx:%vx , vy:%vy)"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% vx.defl=0
    //% vy.defl=0
    //% weight=96
    export function spawnSpritesOnTiles(sprite: Image, kind: number, tile: Image, vx: number = 0, vy: number = 0) {
        tiles.getTilesByType(tile).forEach(tLoc => {
            const s = sprites.create(sprite, kind)
            tiles.placeOnTile(s, tLoc)
            // line below does not work correctly
            tiles.setTileAt(tLoc, img` `)
            s.setVelocity(vx, vy)
            s.setBounceOnWall(true)
        })
    }

    /**
     * HPステータスバーをスプライトに設定する
     */
    //% block="HPステータスバーをスプライト%sprite=variables_get(mySprite) に設定する || (幅: %width , 高さ: %height, オフセット: %offset)"
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% width.defl=20
    //% height.defl=4
    //% offset.defl=4
    //% group="HPステータスバー"
    //% weight=95
    export function setHPStatusBar(sprite: Sprite, width: number = 20, height: number = 4, offset: number = 4) {
        let statusbar = statusbars.create(width, height, StatusBarKind.Health)
        statusbar.attachToSprite(sprite)
        statusbar.setOffsetPadding(0, offset)
    }



    /**
     * スプライトにHPダメージを与える
     */
    //% block="スプライト%sprite=variables_get(mySprite) に%damage のHPダメージを与える"
    //% damage.defl=10
    //% group="HPステータスバー"
    //% weight=94
    export function changeHPStatusBar(sprite: Sprite, damage: number = 10) {
        let statusbar = statusbars.getStatusBarAttachedTo(StatusBarKind.Health, sprite)
        if (statusbar && statusbar.value > 0) {
            statusbar.value = Math.max(0, statusbar.value - damage)
        }
    }

    /**
     * HPステータスバーがゼロになったとき
     */
    //% block="HPステータスバーがゼロになったとき"
    //% draggableParameters="reporter"
    //% group="HPステータスバー"
    //% weight=93
    export function onHPStatusBarZero(handler: (sprite: Sprite, kind: number) => void) {
        const dataKey = `${stateNamespace}_on_hp_zero`
        let handlers = game.currentScene().data[dataKey] as ((sprite: Sprite, spriteKind: number) => void)[]
        if (!handlers) {
            handlers = game.currentScene().data[dataKey] = [] as ((sprite: Sprite, spriteKind: number) => void)[]
        }
        handlers.push(handler)
    }

    statusbars.onZero(StatusBarKind.Health, (statusbar: StatusBarSprite) => {
        const dataKey = `${stateNamespace}_on_hp_zero`
        const handlers = (game.currentScene().data[dataKey] || []) as ((sprite: Sprite, spriteKind: number) => void)[]
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i]
            const sprite = statusbar.spriteAttachedTo()
            handler(sprite, sprite.kind());
        }
    })
}
