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

    type SpriteAngleData = {
        sprite: Sprite,
        direction: SpriteDirection,
        angle: number,
        active: boolean
    }

    type SpriteMoveAnimationData = {
        sprite: Sprite,
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

    type SpriteAttackAnimationData = {
        sprite: Sprite,
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


    /**
     * スプライトの向きを管理する
     */
    //% block="$sprite=variables_get(mySprite) の向きを管理する"
    //% weight=101
    export function manageDirection(sprite: Sprite) {
        if (!sprite) return

        const dataKey = `${stateNamespace}_angle`

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteAngleData = spriteDicts[spriteId]
                    if (!data.active) {
                        continue
                    }
                    const sprite = data.sprite
                    if (sprite.vx === 0 && sprite.vy === 0) {
                        continue
                    }
                    data.angle = Math.atan2(sprite.vy, sprite.vx)
                    if (Math.abs(sprite.vx) > Math.abs(sprite.vy)) {
                        if (sprite.vx > 0) {
                            data.direction = SpriteDirection.RIGHT
                        } else {
                            data.direction = SpriteDirection.LEFT
                        }
                    } else {
                        if (sprite.vy > 0) {
                            data.direction = SpriteDirection.DOWN
                        } else {
                            data.direction = SpriteDirection.UP
                        }
                    }
                }
            })
        }
        sprite.onDestroyed(() => {
            spriteDicts[sprite.id].active = false
        })
        spriteDicts[sprite.id] = {
            sprite: sprite,
            direction: SpriteDirection.DOWN,
            angle: Math.PI * 0.5,
            active: true
        } as SpriteAngleData
    }

    /**
     * 移動アニメーションを設定する
     */
    //% block="移動アニメーションを設定する $sprite=variables_get(mySprite) 上方向 $upFrames=animation_editor 右方向 $rightFrames=animation_editor 下方向 $downFrames=animation_editor 左方向 $leftFrames=animation_editor フレーム間隔 (ms) $frameInterval=timePicker"
    //% frameInterval.defl=100
    //% weight=100
    export function setMoveAnimation(sprite: Sprite, upFrames: Image[], rightFrames: Image[], downFrames: Image[], leftFrames: Image[], frameInterval?: number) {
        if (!sprite) return

        const dataKey = `${stateNamespace}_move`

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteMoveAnimationData = spriteDicts[spriteId]
                    const sprite = data.sprite
                    if (sprite.vx === 0 && sprite.vy === 0) {
                        const image = data.currentFrames[0]
                        if (sprite.image !== image) sprite.setImage(image)
                        data.upLastFrame = 0
                        data.rightLastFrame = 0
                        data.downLastFrame = 0
                        data.leftLastFrame = 0
                        continue
                    }

                    data.elaspedTime += game.eventContext().deltaTimeMillis
                    if (Math.abs(sprite.vx) > Math.abs(sprite.vy)) {
                        if (sprite.vx > 0) {
                            data.direction = SpriteDirection.RIGHT
                            if (data.elaspedTime - data.rightLastUpdated > data.frameInterval) {
                                data.rightLastUpdated = data.elaspedTime
                                data.rightLastFrame = (data.rightLastFrame + 1) % data.rightFrames.length
                                const image = data.rightFrames[data.rightLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.currentFrames = data.rightFrames
                            }
                        } else {
                            data.direction = SpriteDirection.LEFT
                            if (data.elaspedTime - data.leftLastUpdated > data.frameInterval) {
                                data.leftLastUpdated = data.elaspedTime
                                data.leftLastFrame = (data.leftLastFrame + 1) % data.leftFrames.length
                                const image = data.leftFrames[data.leftLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.currentFrames = data.leftFrames
                            }
                        }
                    } else {
                        if (sprite.vy > 0) {
                            data.direction = SpriteDirection.DOWN
                            if (data.elaspedTime - data.downLastUpdated > data.frameInterval) {
                                data.downLastUpdated = data.elaspedTime
                                data.downLastFrame = (data.downLastFrame + 1) % data.downFrames.length
                                const image = data.downFrames[data.downLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.currentFrames = data.downFrames
                            }
                        } else {
                            data.direction = SpriteDirection.UP
                            if (data.elaspedTime - data.upLastUpdated > data.frameInterval) {
                                data.upLastUpdated = data.elaspedTime
                                data.upLastFrame = (data.upLastFrame + 1) % data.upFrames.length
                                const image = data.upFrames[data.upLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.currentFrames = data.upFrames
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
        spriteDicts[sprite.id] = {
            sprite: sprite,
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
        } as SpriteMoveAnimationData
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

        const dataKey = `${stateNamespace}_attack`

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
            game.eventContext().registerFrameHandler(scene.FOLLOW_SPRITE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteAttackAnimationData = spriteDicts[spriteId]
                    const sprite = data.sprite
                    if (Math.abs(sprite.vx) > Math.abs(sprite.vy)) {
                        if (sprite.vx > 0) {
                            data.direction = SpriteDirection.RIGHT
                        } else if (sprite.vx < 0) {
                            data.direction = SpriteDirection.LEFT
                        }
                    } else {
                        if (sprite.vy > 0) {
                            data.direction = SpriteDirection.DOWN
                        } else if (sprite.vy < 0) {
                            data.direction = SpriteDirection.UP
                        }
                    }
                    if (data.attacking && data.attackingSprite) {
                        data.sprite.setVelocity(0, 0)
                        let x = data.sprite.x
                        let y = data.sprite.y
                        if (data.direction === SpriteDirection.UP) {
                            y = data.sprite.top - data.offset
                        } else if (data.direction === SpriteDirection.RIGHT) {
                            x = data.sprite.right + data.offset
                        } else if (data.direction === SpriteDirection.DOWN) {
                            y = data.sprite.bottom + data.offset
                        } else if (data.direction === SpriteDirection.LEFT) {
                            x = data.sprite.left - data.offset
                        }
                        data.attackingSprite.setPosition(x, y)
                    }
                }
            })
            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteAttackAnimationData = spriteDicts[spriteId]
                    const sprite = data.sprite
                    if (data.attacking) {
                        let frames: Image[] = []
                        let spriteFrames: Image[] = []
                        if (data.direction === SpriteDirection.UP) {
                            frames = data.upFrames
                            spriteFrames = data.upSpriteFrames
                        } else if (data.direction === SpriteDirection.RIGHT) {
                            frames = data.rightFrames
                            spriteFrames = data.rightSpriteFrames
                        } else if (data.direction === SpriteDirection.DOWN) {
                            frames = data.downFrames
                            spriteFrames = data.downSpriteFrames
                        } else if (data.direction === SpriteDirection.LEFT) {
                            frames = data.leftFrames
                            spriteFrames = data.leftSpriteFrames
                        }
                        data.elaspedTime += game.eventContext().deltaTimeMillis
                        if (data.elaspedTime - data.lastUpdated > data.frameInterval) {
                            data.lastUpdated = data.elaspedTime
                            data.lastFrame += 1
                            if (data.lastFrame === 0) {
                                if (data.attackingSprite) data.attackingSprite.destroy()
                                data.attackingSprite = sprites.create(frames[0], kind)
                                data.attackingSprite.z = data.sprite.z - 1
                                let x = data.sprite.x
                                let y = data.sprite.y
                                if (data.direction === SpriteDirection.UP) {
                                    y = data.sprite.top - data.offset
                                } else if (data.direction === SpriteDirection.RIGHT) {
                                    x = data.sprite.right + data.offset
                                } else if (data.direction === SpriteDirection.DOWN) {
                                    y = data.sprite.bottom + data.offset
                                } else if (data.direction === SpriteDirection.LEFT) {
                                    x = data.sprite.left - data.offset
                                }
                                data.attackingSprite.setPosition(x, y)
                            }
                            if (data.lastFrame < frames.length) {
                                const image = frames[data.lastFrame]
                                if (data.attackingSprite.image !== image) {
                                    data.attackingSprite.setImage(image)
                                }
                                if (spriteFrames && spriteFrames.length > 1) {
                                    const image = spriteFrames[data.lastFrame]
                                    if (data.sprite.image !== image) {
                                        data.sprite.setImage(image)
                                    }
                                }
                            } else {
                                if (data.attackingSprite) data.attackingSprite.destroy()
                                if (spriteFrames && spriteFrames.length > 1) {
                                    const image = spriteFrames[0]
                                    data.sprite.setImage(image)
                                }
                                data.attacking = false
                            }
                        }
                    }
                }
            })
        }
        spriteDicts[sprite.id] = {
            sprite: sprite,
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
        } as SpriteAttackAnimationData
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

        const dataKey = `${stateNamespace}_attack`

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
        }
        const data = spriteDicts[sprite.id]
        if (!data || data.attacking) return

        data.attacking = true
        data.lastFrame = -1
        data.lastUpdated = 0
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
        const dataKey = `${stateNamespace}_angle`
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
        let handlers = game.currentScene().data[dataKey] as ((sprite: Sprite, kind: number) => void)[]
        if (!handlers) {
            handlers = game.currentScene().data[dataKey] = [] as ((sprite: Sprite, kind: number) => void)[]
        }
        handlers.push(handler)
    }

    statusbars.onZero(StatusBarKind.Health, (statusbar: StatusBarSprite) => {
        const dataKey = `${stateNamespace}_on_hp_zero`
        const handlers = (game.currentScene().data[dataKey] || []) as ((sprite: Sprite, kind: number) => void)[]
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i]
            const sprite = statusbar.spriteAttachedTo()
            handler(sprite, sprite.kind());
        }
    })
}
