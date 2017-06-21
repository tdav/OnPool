using System.Collections.Generic;

namespace OnPoolServer
{
    public class ServerPool
    {
        public string Name { get; set; }
        public List<ServerSwimmer> Swimmers { get; set; }

        private int roundRobin = 0;
        public ServerSwimmer GetRoundRobin()
        {
            if (Swimmers.Count == 0)
            {
                return null;
            }
            var swimmer = Swimmers[roundRobin];
            roundRobin = (roundRobin + 1) % Swimmers.Count;
            return swimmer;
        }
    }
}