"use strict";

import octokit from "octokit";
import lru from "lru-cache";

function getOctokit() {
  let token = process.env.TOKEN;
  let octo = new octokit.Octokit({
    auth: token,
  });
  return octo;
}

export function getReleases(owner, repo) {
  let octo = getOctokit();
  return octo.request("GET /repos/{owner}/{repo}/releases", {
    owner: owner,
    repo: repo,
  });
}

export async function getRelease(owner, repo, version) {
  let octo = getOctokit();

  const releases = await getReleases(owner, repo);
    let release = releases.data.find(function (release_1) {
        return release_1.tag_name === version || release_1.tag_name === "v" + version;
    });
    if (release) {
        return octo.request("GET /repos/{owner}/{repo}/releases/{id}", {
            owner: owner,
            repo: repo,
            id: release.id,
        });
    } else {
        console.log("release not found");
        return Promise.reject(new Error(`Release ${version} not found`));
    }
}

export function getDownloadUrl(release, os, arch) {
  let asset = release.data.assets.find(function (asset) {
    return asset.name.endsWith(`_${os}_${arch}.zip`);
  });
  return asset.browser_download_url;
}

export function getShasumsUrl(release) {
  let SHA256SUMS = release.data.assets.find(function (asset) {
    return asset.name.endsWith("SHA256SUMS");
  });
  if (SHA256SUMS) {
    return SHA256SUMS.browser_download_url;
  } else {
    return null;
  }
}

export function getShasumsSignatureUrl(release) {
  let SHA256SUMS = release.data.assets.find(function (asset) {
    return asset.name.endsWith("SHA256SUMS.sig");
  });

  if (SHA256SUMS) {
    return SHA256SUMS.browser_download_url;
  } else {
    return null;
  }
}

export async function getShasum(release, filename) {
  let sumsUrl = getShasumsUrl(release);
  let res = await fetch(sumsUrl);
  if (res.status !== 200) {
    return Promise.reject(new Error(`Failed to fetch ${sumsUrl}`));
  }

  console.log(`Fetched ${sumsUrl}`);

  let sums = await res.text();
  let lines = sums.split("\n");
  let shasum = lines.find(function (line) {
    return line.endsWith(filename);
  });

  if (shasum) {
    console.log(`Found ${filename} in ${sumsUrl}`);
    return shasum.split(" ")[0];
  } else {
    return Promise.reject(
      new Error(`Failed to find ${filename} in ${sumsUrl}`)
    );
  }
}
