class ScoreSnapshotManager {
  constructor(score) {
    this.snapshotBuffer = [ score.clone() ];
    this.currentSnapshotIdx = 0;
  }

  register(score) {
    ++this.currentSnapshotIdx;
    let numFollowingSnapshots = this.snapshotBuffer.length - this.currentSnapshotIdx;
    this.snapshotBuffer.splice(
      this.currentSnapshotIdx,
      numFollowingSnapshots,
      score.clone(),
    );
  }

  isFirstSnapshot() {
    return (this.currentSnapshotIdx === 0);
  }

  isLastSnapshot() {
    return (this.currentSnapshotIdx === (this.snapshotBuffer.length - 1));
  }

  backwardCurrentSnapshotIdx() {
    if (this.currentSnapshotIdx === null) return false;
    if (this.isFirstSnapshot()) return false;
    --this.currentSnapshotIdx;
    return true;
  }

  forwardCurrentSnapshotIdx() {
    if (this.currentSnapshotIdx === null) return false;
    if (this.isLastSnapshot()) return false;
    ++this.currentSnapshotIdx;
    return true;
  }

  getSnapshot() {
    return this.snapshotBuffer[this.currentSnapshotIdx];
  }
}

Object.defineProperty(
  ScoreSnapshotManager,
  'instance',
  {
    value: null,
    writable: true,
  },
)

export default {
  register(score) {
    if (ScoreSnapshotManager.instance === null) {
      ScoreSnapshotManager.instance = new ScoreSnapshotManager(score);
    }
    if (ScoreSnapshotManager.instance.getSnapshot().isEqualTo(score)) return;
    ScoreSnapshotManager.instance.register(score);
  },

  isFirstSnapshot() {
    return ScoreSnapshotManager.instance.isFirstSnapshot();
  },

  isLastSnapshot() {
    return ScoreSnapshotManager.instance.isLastSnapshot();
  },

  undo() {
    if (ScoreSnapshotManager.instance.backwardCurrentSnapshotIdx()) {
      return ScoreSnapshotManager.instance.getSnapshot().clone();
    } else {
      return null;
    }
  },

  redo() {
    if (ScoreSnapshotManager.instance.forwardCurrentSnapshotIdx()) {
      return ScoreSnapshotManager.instance.getSnapshot().clone();
    } else {
      return null;
    }
  },
}