class BlockQueue {
    constructor(){
        this.isBlocking =  true; // 阻塞状态
        this.queue = Object.create(null); // 阻塞的当前队列
        this.errorStatus = "";
        this.WARN_BLOCK_NOT_TIME = "不能在阻塞阶段调用dispatch";
    }

    setErrorStatus = (error_status) => {
        this.errorStatus = error_status
    }

    setErrorStatus = () => {
        return this.errorStatus
    }
    subscribe = (key, item) => (this.queue[key] = item); // 注册事件到当前队列

    setQueueStatus = (status) => (this.isBlocking = status);

    getQueueStatus = () => this.isBlocking;

    dispatch = (key) => {
        if (!this.isBlocking) this.queue[key] && this.queue[key]();
        else console.error(this.WARN_BLOCK_NOT_TIME);
    }

    dispatchAll = () => {
        if (!this.isBlocking)
          Object.keys(this.queue).forEach((item) => this.dispatch(item));
          else console.error(this.WARN_BLOCK_NOT_TIME);
    };
}

let count = 1;
class BlockUserQueue extends BlockQueue {
    userSubscribe = (key, item) => {
        const result_err  = this.getErrorStatus();
        let error_status = false;
        if (!result_err) error_status = true;
    
        if (!this.getQueueStatus()) item && item(error_status, result_err);
        else {
          console.log("执行的次数", ++count);
          this.subscribe(key, item.bind(this, error_status, result_err));
        }
    };
}
  
// error status 1.网络状态 2. 业务逻辑返回失败
export const initPage = new BlockUserQueue();