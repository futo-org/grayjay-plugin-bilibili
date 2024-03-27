export type AuthenticationResponse = {
    jwt: string
}

export type RequiredSource = Required<Source>

export type VideoInfoJSON = {
    videoData: {
        title: string
        pic: string
        pubdate: number
        owner: {
            mid: number
            name: string
            face: string
        }
        stat: {
            view: number
            like: number
        }
        desc_v2: {
            raw_text: string
        }[]
    }
}

export type VideoPlayJSON = {
    data: {
        accept_description: string[]
        accept_quality: number[]
        video_codecid: number
        dash: {
            duration: number
            video: {
                base_url: string
                mime_type: string
                codecs: string
                bandwidth: number
                width: number
                height: number
                codecid: number
                id: number
            }[]
            audio: {
                base_url: string
                mime_type: string
                codecs: string
                bandwidth: number
            }[]
        }
    }
}

export type HomePageJSON = {
    data: {
        // TODO combine this type with the type above that's loaded on the actual video page (but only if it's really really the same)
        item: {
            // id: number
            bvid: string
            uri: string
            pic: string
            title: string
            duration: number
            pubdate: number
            stat: {
                view: number
            }
            owner: {
                mid: number
                name: string
                face: string
            }
        }[]
    }
}