import { ActionContext } from "vuex"
import { axios } from "@/api/api"
import type { State as RootState, DocBannerState } from "@@/store"
// import { Response, DocBanner } from "@@/global"
// import config from "@/../config/config"

const banner = {
    namespaced: true,
    state: {
        banner: [],
    },
    mutations: {},
    actions: {
        async getDocBanner(context: ActionContext<DocBannerState, RootState>, payload: { projectId: string }): Promise<DocBannerState> {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId,
                };
                axios.get("/api/project/doc_tree_node", { params }).then((res) => {
                    const result = res.data;
                    context.commit("changeDocBanner", result);
                    context.commit("changeDocPathEnum");
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            });
        },
    },
}

export { banner }
