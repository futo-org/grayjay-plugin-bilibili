export type RequiredSource = Required<Source<BiliBiliCommentContext>>

/*
interface TBiliBiliCommentContext extends thing {
    "avid": string
    "rpid": string
}*/

// type thing = { [key: string]: string }

export type BiliBiliCommentContext = {
    readonly avid: string
    readonly rpid: string
}

export type Wbi = { readonly wbi_img_key: string, readonly wbi_sub_key: string }

export type SpaceVideos = {
    readonly data: {
        readonly list: {
            readonly vlist: {
                readonly title: string
                readonly bvid: string
                readonly pic: string
                readonly length: string
                readonly created: number
                readonly play: number
            }[]
        }
    }
}

export type SpaceSearchResults = {
    readonly data: {
        readonly result: {
            readonly mid: number
            readonly uname: string
            readonly upic: string
            readonly fans: number
            readonly usign: string
        }[]
    }
}

export type LivePlayJSON = {
    readonly data: {
        readonly playurl_info: {
            readonly playurl: {
                readonly stream: {
                    readonly format: {
                        readonly codec: {
                            readonly base_url: string
                            readonly url_info: {
                                readonly host: string
                                readonly extra: string
                            }[]
                        }[]
                    }[]
                }[]
            }
        }
    }
}

export type SpaceInfoJSON = {
    readonly data: {
        readonly name: string
        readonly face: string
        readonly top_photo: string
        readonly sign: string
    }
}

// make sure that these keys don't have any invalid URI characters. if they do them we need to update the code to encode them
export type Params = {
    readonly search_type?: "bili_user" | "live" | "video"
    readonly mode?: number
    readonly pagination_str?: string
    readonly type?: number
    readonly oid?: number
    // season_id?: number
    // readonly search_type?: "video"
    readonly pn?: number
    readonly page?: number
    readonly ps?: number
    readonly page_size?: number
    readonly keyword?: string
    readonly fnval?: number
    // fourk?: number
    // fnver?: number
    // qn?: number
    readonly avid?: number
    readonly bvid?: string
    readonly mid?: number
    readonly host_mid?: number
    readonly cid?: number
    // platform?: string
    // token?: ""
    // web_location: number
    // current timestamp Math.round(Date.now() / 1e3)
    readonly wts: number
    // device fingerprint values
    readonly dm_cover_img_str?: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ"
    readonly dm_img_inter?: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`
    readonly dm_img_str?: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ"
    readonly dm_img_list?: "[]"
}

export type SubCommentsJSON = {
    readonly data: {
        readonly replies: {
            readonly rpid: number
            readonly ctime: number
            readonly like: number
            readonly member: {
                readonly mid: number
                readonly uname: string
                readonly avatar: string
            }
            readonly content: {
                readonly message: string
            }
            readonly replies: {
                readonly rpid: number
            }[]
        }[]
    }
}

export type CommentsJSON = {
    readonly data: {
        readonly replies: {
            readonly rpid: number
            readonly ctime: number
            readonly like: number
            readonly member: {
                readonly mid: number
                readonly uname: string
                readonly avatar: string
            }
            readonly content: {
                readonly message: string
            }
            readonly replies: {
                readonly rpid: number
            }[]
        }[]
    }
}

export type PlaylistJSON = {
    readonly data: {
        readonly archives: {
            readonly bvid: string
            readonly duration: string
            readonly pic: string
            readonly pubdate: number
            readonly title: string
            readonly stat: {
                readonly view: number
            }
        }[]
        readonly meta: {
            readonly cover: string
            readonly name: string
        }
    }
}

type TextNode = {
    readonly text: string
    readonly type: "RICH_TEXT_NODE_TYPE_TEXT"
} | {
    readonly text: string
    readonly jump_url: string
    readonly type: "RICH_TEXT_NODE_TYPE_TOPIC"
} | {
    readonly text: string,
    readonly type: "RICH_TEXT_NODE_TYPE_EMOJI"
} | {
    readonly pics: {
        readonly height: number
        readonly size: number
        readonly src: string
        readonly width: number
    }[],
    readonly rid: string
    readonly text: string
    readonly type: "RICH_TEXT_NODE_TYPE_VIEW_PICTURE"
}

type Major = {
    readonly type: "MAJOR_TYPE_DRAW"
    readonly draw: {
        readonly items: {
            src: string // a url
        }[]
    }
} | {
    readonly type: "MAJOR_TYPE_ARCHIVE"
    readonly archive: {
        bvid: string
    }
}

export type SpacePostsJSON = {
    readonly data: {
        readonly items: {
            readonly id_str: string
            readonly modules: {
                readonly module_dynamic: {
                    readonly desc: null | {
                        readonly rich_text_nodes: TextNode[]
                    }
                    readonly major: null | Major
                    readonly topic: null | {
                        readonly id: number
                        readonly jump_url: string
                        readonly name: string
                    }
                }
                readonly module_author: {
                    readonly pub_ts: number
                }
                readonly module_stat: {
                    readonly like: {
                        readonly count: number
                    }
                }
            }
        }[]
    }
}

export type SpaceVideosJSON = {
    readonly data: {
        readonly list: {
            readonly vlist: {
                readonly bvid: string
                readonly title: string
                readonly length: string
                readonly pic: string
                // upic: string
                readonly play: number
                // pubdate: number
                // mid: number
                readonly author: string
            }[]
        }
    }
}

export type LiveSearchResultsJSON = {
    readonly data: {
        readonly result: {
            readonly live_room: {
                readonly roomid: number
                readonly title: string
                readonly uid: number
                readonly uname: string
                readonly uface: string
                readonly user_cover: string // livestream thumbnail
                readonly watched_show: {
                    readonly num: number // current viewers
                }
                readonly live_time: string
            }[]
        }
    }
}

export type SearchResultsJSON = {
    readonly data: {
        readonly result: {
            readonly bvid: string
            readonly title: string
            readonly duration: string
            readonly pic: string
            readonly upic: string
            readonly play: number
            readonly pubdate: number
            readonly mid: number
            readonly author: string
        }[]
    }
}

/*
export type OldSearchResultsJSON = {
    data: {
        result: {
            result_type: string
            data: {
                bvid: string
                title: string
                arcurl: string
                duration: string
                pic: string
                upic: string
                play: number
                pubdate: number
            }[]
        }[]
    }
}*/

export type VideoInfoJSON = {
    readonly data: {
        readonly View: {
            readonly title: string
            readonly pic: string
            readonly pubdate: number
            readonly cid: number
            readonly aid: number
            readonly owner: {
                readonly mid: number
                readonly name: string
                readonly face: string
            }
            readonly stat: {
                readonly view: number
                readonly like: number
            }
            readonly desc_v2: null | {
                readonly raw_text: string
            }[]
        }
        readonly Card: {
            readonly card: {
                readonly fans: number
            }
        }
    }
}

export type VideoPlayJSON = {
    readonly data: {
        readonly accept_description: string[]
        readonly accept_quality: number[]
        readonly video_codecid: number
        readonly dash: {
            readonly duration: number
            readonly video: {
                readonly base_url: string
                readonly mime_type: string
                readonly codecs: string
                readonly bandwidth: number
                readonly width: number
                readonly height: number
                readonly codecid: number
                readonly id: number
            }[]
            readonly audio: {
                readonly base_url: string
                readonly mime_type: string
                readonly codecs: string
                readonly bandwidth: number
            }[]
        }
    }
}

export type HomePageJSON = {
    readonly data: {
        // TODO combine this type with the type above that's loaded on the actual video page (but only if it's really really the same)
        readonly item: {
            // id: number
            readonly bvid: string
            readonly uri: string
            readonly pic: string
            readonly title: string
            readonly duration: number
            readonly pubdate: number
            readonly stat: {
                readonly view: number
            }
            readonly owner: {
                readonly mid: number
                readonly name: string
                readonly face: string
            }
        }[]
    }
}