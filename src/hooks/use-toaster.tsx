import { Cluster } from "@/components/cluster/cluster-data-access"
import { ExplorerLink } from "@/components/cluster/cluster-ui"
import toast from "react-hot-toast"


export function useTransactionToast(cluster: Cluster) {
    return (signature: string) => {
      toast.success(
        <div className={'text-center'}>
          <div className="text-lg">Transaction sent</div>
          <ExplorerLink path={`tx/${signature}`} label={'View Transaction'} className="btn btn-xs btn-primary" cluster={cluster} />
        </div>,
      )
    }
}
 
export function ellipsify(str = '', len = 4) {
  if (str.length > 30) {
    return str.substring(0, len) + '..' + str.substring(str.length - len, str.length)
  }
  return str
}