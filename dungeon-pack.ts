/**
 * ダンジョンパック
 */
//% weight=150 color=#e67e22 icon="\uf3ed" block="ダンジョンパック"
namespace dungeon_pack {
    const stateNamespace = "__dungeon_pack";

    type SpriteMoveAnimationData = {
        elaspedTime: number,
        frameInterval: number,
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

    /**
     * 移動アニメーションを設定する
     * https://github.com/microsoft/pxt-common-packages/blob/master/libs/game/animation.ts#L589
     */
    //% block="移動アニメーションを設定する $sprite=variables_get(mySprite) 上方向 $upFrames=animation_editor 右方向 $rightFrames=animation_editor 下方向 $downFrames=animation_editor 左方向 $leftFrames=animation_editor フレーム間隔 (ms) $frameInterval=timePicker"
    //% weight=100
    export function setMoveAnimation(sprite: Sprite, upFrames: Image[], rightFrames: Image[], downFrames: Image[], leftFrames: Image[], frameInterval?: number) {
        if (!sprite) return

        let spriteDicts = game.currentScene().data[stateNamespace]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[stateNamespace] = {}
        }
        spriteDicts[sprite.id] = {
            elaspedTime: 0,
            frameInterval: frameInterval,
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
        game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
            if (!sprite) return

            const data: SpriteMoveAnimationData = spriteDicts[sprite.id]
            if (sprite.vx === 0 && sprite.vy === 0) {
                const image = data.currentFrames[0]
                if (sprite.image !== image) sprite.setImage(image)
                data.upLastFrame = 0
                data.rightLastFrame = 0
                data.downLastFrame = 0
                data.leftLastFrame = 0
                return
            }

            data.elaspedTime += game.eventContext().deltaTimeMillis
            if (Math.abs(sprite.vx) > Math.abs(sprite.vy)) {
                if (sprite.vx > 0) {
                    if (data.elaspedTime - data.rightLastUpdated > data.frameInterval) {
                        data.rightLastUpdated = data.elaspedTime
                        data.rightLastFrame = (data.rightLastFrame + 1) % leftFrames.length
                        const image = data.rightFrames[data.rightLastFrame]
                        if (sprite.image !== image) sprite.setImage(image)
                        data.currentFrames = data.rightFrames
                    }
                } else {
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
                    if (data.elaspedTime - data.downLastUpdated > data.frameInterval) {
                        data.downLastUpdated = data.elaspedTime
                        data.downLastFrame = (data.downLastFrame + 1) % data.downFrames.length
                        const image = data.downFrames[data.downLastFrame]
                        if (sprite.image !== image) sprite.setImage(image)
                        data.currentFrames = data.downFrames
                    }
                } else {
                    if (data.elaspedTime - data.upLastUpdated > data.frameInterval) {
                        data.upLastUpdated = data.elaspedTime
                        data.upLastFrame = (data.upLastFrame + 1) % data.upFrames.length
                        const image = data.upFrames[data.upLastFrame]
                        if (sprite.image !== image) sprite.setImage(image)
                        data.currentFrames = data.upFrames
                    }
                }
            }
        })
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
    //% weight=97
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
}
