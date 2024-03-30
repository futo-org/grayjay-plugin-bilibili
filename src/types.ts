export type RequiredSource = Required<Source>

export type Wbi = { wbi_img_key: string, wbi_sub_key: string }

export type SpaceInfoJSON = {
    data: {
        name: string
        face: string
        top_photo: string
        sign: string
    }
}

// make sure that these keys don't have any invalid URI characters. if they do them we need to update the code to encode them
export type Params = {
    fnval?: number
    // fourk?: number
    // fnver?: number
    // qn?: number
    avid?: number
    bvid?: string
    mid?: number
    cid?: number
    platform: string
    token: ""
    web_location: number
    // current timestamp Math.round(Date.now() / 1e3)
    wts: number
    // device fingerprint values
    dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ"
    dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`
    dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ"
    dm_img_list: "[]"
}

export type VideoInfoJSON = {
    data: {
        View: {
            title: string
            pic: string
            pubdate: number
            cid: number
            owner: {
                mid: number
                name: string
                face: string
            }
            stat: {
                view: number
                like: number
            }
            desc_v2: null | {
                raw_text: string
            }[] 
        }
        Card: {
            card: {
                fans: number
            }
        }
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