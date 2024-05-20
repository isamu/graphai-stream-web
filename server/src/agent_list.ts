import express from "express";
import { AgentFunctionInfo } from "graphai/lib/type";

import * as packages from "graphai/lib/experimental_agents";

const packages2data = (packages: Record<string, AgentFunctionInfo>) => {
  return Object.keys(packages).reduce(
    (
      tmp: Record<
        string,
        {
          name: string;
          description: string;
          category: string[];
          author: string;
          repository: string;
          license: string;
          samples: { inputs: any; params: any; result: any }[];
        }
      >,
      current: string,
    ) => {
      const { name, description, category, author, repository, license, samples } = packages[current];

      tmp[current] = {
        name,
        description,
        category,
        author,
        repository,
        license,
        samples,
      };
      return tmp;
    },
    {},
  );
};

export const agentList = async (req: express.Request, res: express.Response) => {
  res.json(packages2data(packages));
};
